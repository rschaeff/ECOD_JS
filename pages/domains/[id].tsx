// pages/domains/[id].tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChevronLeft, ExternalLink, Download, Dna, Globe, FileText, Table2, Info, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
//import { Progress } from '@/components/ui/progress';
import Layout from '@/components/Layout';

// Mock domain data interface
interface DomainData {
  id: string;
  unp_acc: string;
  domain_id: string;
  range: string;
  t_group: string;
  t_group_name: string;
  cluster_id: number;
  species: string;
  taxonomyInfo: {
    tax_id: number;
    scientific_name: string;
    common_name?: string;
    phylum: string;
    class: string;
    order: string;
    family: string;
    genus: string;
    superkingdom: string;
  };
  sequence: string;
  structureInfo: {
    resolution?: number;
    experimental: boolean;
    depositionDate?: string;
    experimentalMethod?: string;
    confidenceScore: number;
    pdbId?: string;
  };
  features: Array<{
    type: string;
    start: number;
    end: number;
    description: string;
  }>;
  secondaryStructure: {
    helixCount: number;
    sheetCount: number;
    ssString: string;
  };
}

const DomainDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [domainData, setDomainData] = useState<DomainData | null>(null);
  
  // Load domain data
  useEffect(() => {
    if (!id) return;
    
    const fetchDomainData = async () => {
      try {
        setLoading(true);
        
        // In a real application, we would fetch data from API
        // For now, we'll use mock data
        // Mock data generation based on domain ID
        const mockData: DomainData = {
          id: id as string,
          unp_acc: id.toString().includes('P') ? id.toString() : `P${Math.floor(Math.random() * 90000) + 10000}`,
          domain_id: id as string,
          range: "23-178",
          t_group: "2008.1.1",
          t_group_name: "Alpha/Beta-Hydrolases",
          cluster_id: 42,
          species: "Homo sapiens",
          taxonomyInfo: {
            tax_id: 9606,
            scientific_name: "Homo sapiens",
            common_name: "Human",
            phylum: "Chordata",
            class: "Mammalia",
            order: "Primates",
            family: "Hominidae",
            genus: "Homo",
            superkingdom: "Eukaryota"
          },
          sequence: "MKLLVLGLGLLVLQALGIQQIYPPINVNPQYGFANKQDDVFSWKPIKTSDFRTGDETKIKFCPYGLSGNYTDAIEIPKLKERVDRIITLMDDDAICVGSALGDAVNPKIKLNKPAWSMDVKKNFNLIEDYRGGYFPNTALYDLNYRQFWTSKTRDELKTSAKKKGMIVMNDQLVAPNAQLKAFDNFMIRYTDKFNVPVKYKTKTYNFVEGDRG",
          structureInfo: {
            resolution: id.toString().includes('d') ? 1.8 : undefined,
            experimental: id.toString().includes('d'),
            depositionDate: id.toString().includes('d') ? "2019-03-15" : undefined,
            experimentalMethod: id.toString().includes('d') ? "X-ray diffraction" : undefined,
            confidenceScore: id.toString().includes('d') ? 0.95 : 0.82,
            pdbId: id.toString().includes('d') ? id.toString().substring(1, 5) : undefined
          },
          features: [
            { 
              type: "active_site", 
              start: 45, 
              end: 45, 
              description: "Catalytic serine" 
            },
            { 
              type: "binding_site", 
              start: 72, 
              end: 78, 
              description: "Substrate binding pocket" 
            },
            { 
              type: "motif", 
              start: 120, 
              end: 132, 
              description: "G-X-S-X-G motif" 
            }
          ],
          secondaryStructure: {
            helixCount: 8,
            sheetCount: 7,
            ssString: "CCHHHHHHHHHCCCCEEEEECCCCHHHHHCCCEEEEEEECCCHHHHHHHHHHCCEEEEEECCCHHHHHHCCCEEEEEECCCCCCHHHHHHHHHHHCCCEEEEEECCCCC"
          }
        };
        
        setDomainData(mockData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching domain details:', err);
        setError('Failed to load domain details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDomainData();
  }, [id]);
  
  // Render sequence with secondary structure and features
  const renderSequenceWithAnnotations = () => {
    if (!domainData) return null;
    
    const { sequence, secondaryStructure, features } = domainData;
    
    // Create an array to track features at each position
    const featurePositions = Array(sequence.length).fill(null);
    features.forEach(feature => {
      for (let i = feature.start - 1; i < feature.end; i++) {
        if (i >= 0 && i < sequence.length) {
          featurePositions[i] = feature.type;
        }
      }
    });
    
    // Create an array for secondary structure
    const ssArray = secondaryStructure.ssString.split('');
    
    // Group sequence into chunks of 10 for display
    const sequenceChunks = [];
    const ssChunks = [];
    const featureChunks = [];
    
    for (let i = 0; i < sequence.length; i += 10) {
      sequenceChunks.push(sequence.slice(i, i + 10));
      ssChunks.push(ssArray.slice(i, i + 10));
      featureChunks.push(featurePositions.slice(i, i + 10));
    }
    
    return (
      <div className="font-mono text-sm mt-4 border rounded-md overflow-hidden">
        <div className="grid grid-cols-[80px_auto] bg-gray-50 text-xs border-b">
          <div className="p-2 font-bold border-r">Position</div>
          <div className="p-2 grid grid-cols-10">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="text-center">{i + 1}</div>
            ))}
          </div>
        </div>
        
        {sequenceChunks.map((chunk, chunkIndex) => (
          <div key={chunkIndex} className="grid grid-cols-[80px_auto]">
            <div className="p-2 bg-gray-50 text-xs font-bold border-r">
              {chunkIndex * 10 + 1}-{chunkIndex * 10 + chunk.length}
            </div>
            <div>
              {/* Secondary structure */}
              <div className="grid grid-cols-10 text-center p-1 bg-blue-50 text-xs border-b">
                {ssChunks[chunkIndex].map((ss, i) => (
                  <div key={i} className="w-full">
                    {ss === 'H' ? 'H' : ss === 'E' ? 'E' : '-'}
                  </div>
                ))}
              </div>
              
              {/* Sequence */}
              <div className="grid grid-cols-10 text-center p-1">
                {chunk.split('').map((aa, i) => (
                  <div 
                    key={i} 
                    className={`w-full ${
                      featureChunks[chunkIndex][i] === 'active_site' ? 'bg-red-200 font-bold' :
                      featureChunks[chunkIndex][i] === 'binding_site' ? 'bg-green-200' :
                      featureChunks[chunkIndex][i] === 'motif' ? 'bg-yellow-200' : ''
                    }`}
                  >
                    {aa}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        
        {/* Legend */}
        <div className="p-2 bg-gray-50 border-t flex gap-4 text-xs">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-red-200 mr-1"></span> Active Site
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-green-200 mr-1"></span> Binding Site
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-yellow-200 mr-1"></span> Motif
          </div>
          <div className="flex items-center ml-4">
            <strong>H</strong>: α-helix
          </div>
          <div className="flex items-center">
            <strong>E</strong>: β-strand
          </div>
          <div className="flex items-center">
            <strong>-</strong>: Coil
          </div>
        </div>
      </div>
    );
  };
  
  // Render loading state
  if (loading) {
    return (
      <Layout title="Loading Domain Details">
        <div className="flex justify-center items-center h-64">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }
  
  // Render error state
  if (error || !domainData) {
    return (
      <Layout title="Domain Details Error">
        <div className="flex justify-center items-center h-64 flex-col">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-2" />
          <p className="text-red-500">{error || 'Domain data not available'}</p>
          <Link href="/clusters" className="mt-4 text-blue-600 hover:underline">
            Return to clusters
          </Link>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title={`Domain ${domainData.domain_id}`}>
      {/* Header section */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <Link href={`/clusters/${domainData.cluster_id}`} className="hover:bg-gray-100 p-2 rounded-full">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold">{domainData.domain_id}</h1>
          <Badge className="ml-2 bg-blue-500">
            {domainData.t_group_name}
          </Badge>
        </div>
        <p className="text-gray-500 ml-12">
          UniProt: 
          <a 
            href={`https://www.uniprot.org/uniprot/${domainData.unp_acc}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline mx-1"
          >
            {domainData.unp_acc}
          </a>
          • Range: {domainData.range} • Species: {domainData.species}
        </p>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center">
              <Dna className="h-4 w-4 mr-1" /> Sequence Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div className="flex justify-between mb-1">
                <span>Length:</span>
                <span className="font-medium">{domainData.sequence.length} aa</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>α-helices:</span>
                <span className="font-medium">{domainData.secondaryStructure.helixCount}</span>
              </div>
              <div className="flex justify-between">
                <span>β-sheets:</span>
                <span className="font-medium">{domainData.secondaryStructure.sheetCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center">
              <Globe className="h-4 w-4 mr-1" /> Taxonomy Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div className="flex justify-between mb-1">
                <span>Organism:</span>
                <span className="font-medium">{domainData.taxonomyInfo.scientific_name}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Superkingdom:</span>
                <span className="font-medium">{domainData.taxonomyInfo.superkingdom}</span>
              </div>
              <div className="flex justify-between">
                <span>NCBI Taxonomy ID:</span>
                <a 
                  href={`https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=${domainData.taxonomyInfo.tax_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline flex items-center"
                >
                  {domainData.taxonomyInfo.tax_id}
                  <ExternalLink size={12} className="ml-1" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center">
              <FileText className="h-4 w-4 mr-1" /> Structure Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div className="flex justify-between mb-1">
                <span>Structure Type:</span>
                <span className="font-medium">
                  {domainData.structureInfo.experimental ? 'Experimental' : 'Predicted (AlphaFold)'}
                </span>
              </div>
              {domainData.structureInfo.resolution && (
                <div className="flex justify-between mb-1">
                  <span>Resolution:</span>
                  <span className="font-medium">{domainData.structureInfo.resolution} Å</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Confidence Score:</span>
                <span className="font-medium">{(domainData.structureInfo.confidenceScore * 100).toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for details */}
      <Tabs defaultValue="sequence" className="w-full">
        <TabsList>
          <TabsTrigger value="sequence">Sequence</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="function">Function</TabsTrigger>
          <TabsTrigger value="taxonomy">Taxonomy</TabsTrigger>
        </TabsList>
        
        {/* Sequence Tab */}
        <TabsContent value="sequence" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Domain Sequence</CardTitle>
              <CardDescription>Protein sequence with annotations highlighting functional regions and secondary structure</CardDescription>
            </CardHeader>
            <CardContent>
              {renderSequenceWithAnnotations()}
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Functional Features</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Feature</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {domainData.features.map((feature, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium capitalize">
                            {feature.type.replace('_', ' ')}
                          </TableCell>
                          <TableCell>
                            {feature.start === feature.end 
                              ? feature.start 
                              : `${feature.start}-${feature.end}`}
                          </TableCell>
                          <TableCell>{feature.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Secondary Structure Composition</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">α-helix</span>
                        <span className="text-sm">
                          {Math.round(domainData.secondaryStructure.ssString.split('').filter(s => s === 'H').length / 
                            domainData.secondaryStructure.ssString.length * 100)}%
                        </span>
                      </div>
                      {/*<Progress 
                        value={domainData.secondaryStructure.ssString.split('').filter(s => s === 'H').length / 
                          domainData.secondaryStructure.ssString.length * 100} 
                        className="h-2.5 bg-gray-200" 
                      />*/}
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">β-strand</span>
                        <span className="text-sm">
                          {Math.round(domainData.secondaryStructure.ssString.split('').filter(s => s === 'E').length / 
                            domainData.secondaryStructure.ssString.length * 100)}%
                        </span>
                      </div>
                      {/*<Progress 
                        value={domainData.secondaryStructure.ssString.split('').filter(s => s === 'E').length / 
                          domainData.secondaryStructure.ssString.length * 100} 
                        className="h-2.5 bg-gray-200" 
                      />*/}
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Coil/Loop</span>
                        <span className="text-sm">
                          {Math.round(domainData.secondaryStructure.ssString.split('').filter(s => s === 'C').length / 
                            domainData.secondaryStructure.ssString.length * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={domainData.secondaryStructure.ssString.split('').filter(s => s === 'C').length / 
                          domainData.secondaryStructure.ssString.length * 100} 
                        className="h-2.5 bg-gray-200" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Structure Tab */}
        <TabsContent value="structure" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Domain Structure</CardTitle>
              <CardDescription>3D structural representation and quality assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-100 rounded-md flex items-center justify-center p-4 h-80">
                  <div className="text-center text-gray-400">
                    <Table2 size={48} className="mx-auto mb-4" />
                    <p>3D Structure Visualization Placeholder</p>
                    <p className="text-xs mt-2">This would be a 3D molecular viewer in the actual implementation</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Structure Details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-[120px_auto] gap-2">
                      <div className="text-sm font-medium">Type:</div>
                      <div className="text-sm">
                        {domainData.structureInfo.experimental ? 'Experimental' : 'Predicted (AlphaFold)'}
                      </div>
                      
                      {domainData.structureInfo.pdbId && (
                        <>
                          <div className="text-sm font-medium">PDB ID:</div>
                          <div className="text-sm">
                            <a 
                              href={`https://www.rcsb.org/structure/${domainData.structureInfo.pdbId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center"
                            >
                              {domainData.structureInfo.pdbId}
                              <ExternalLink size={12} className="ml-1" />
                            </a>
                          </div>
                        </>
                      )}
                      
                      {domainData.structureInfo.experimentalMethod && (
                        <>
                          <div className="text-sm font-medium">Method:</div>
                          <div className="text-sm">{domainData.structureInfo.experimentalMethod}</div>
                        </>
                      )}
                      
                      {domainData.structureInfo.resolution && (
                        <>
                          <div className="text-sm font-medium">Resolution:</div>
                          <div className="text-sm">{domainData.structureInfo.resolution} Å</div>
                        </>
                      )}
                      
                      {domainData.structureInfo.depositionDate && (
                        <>
                          <div className="text-sm font-medium">Deposited:</div>
                          <div className="text-sm">{domainData.structureInfo.depositionDate}</div>
                        </>
                      )}
                      
                      <div className="text-sm font-medium">Confidence:</div>
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={domainData.structureInfo.confidenceScore * 100} 
                            className="h-2.5 bg-gray-200 flex-grow" 
                          />
                          <span>{(domainData.structureInfo.confidenceScore * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-md font-medium mb-2">Structure Assessment</h4>
                      <div className="bg-blue-50 p-3 rounded-md text-sm">
                        <p>
                          {domainData.structureInfo.experimental 
                            ? `This is an experimentally determined structure with ${domainData.structureInfo.resolution} Å resolution. The structure is of high quality and suitable for detailed analysis of protein-ligand interactions and active site geometry.`
                            : `This is a predicted structure with ${(domainData.structureInfo.confidenceScore * 100).toFixed(1)}% confidence score. The overall fold is likely accurate, but fine details of side-chain positioning and loop regions may have lower accuracy.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Function Tab */}
        <TabsContent value="function" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Domain Function</CardTitle>
              <CardDescription>Functional annotations and biochemical properties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Functional Classification</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="grid grid-cols-[120px_auto] gap-2">
                        <div className="text-sm font-medium">T-Group:</div>
                        <div className="text-sm">{domainData.t_group} ({domainData.t_group_name})</div>
                        
                        <div className="text-sm font-medium">Family:</div>
                        <div className="text-sm">Carboxylesterase</div>
                        
                        <div className="text-sm font-medium">EC Number:</div>
                        <div className="text-sm">
                          <a 
                            href="https://enzyme.expasy.org/EC/3.1.1.1"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center"
                          >
                            3.1.1.1
                            <ExternalLink size={12} className="ml-1" />
                          </a>
                        </div>
                        
                        <div className="text-sm font-medium">GO Terms:</div>
                        <div className="text-sm flex flex-wrap gap-1">
                          <Badge variant="secondary">carboxylesterase activity</Badge>
                          <Badge variant="secondary">hydrolase activity</Badge>
                          <Badge variant="secondary">metabolic process</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Catalytic Activity</h4>
                      <p className="text-sm">Hydrolysis of an ester bond, specifically carboxylic ester hydrolysis, resulting in the formation of an alcohol and a carboxylic acid.</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Active Site & Binding</h3>
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Active Site</TableCell>
                          <TableCell>Ser45</TableCell>
                          <TableCell>Catalytic nucleophile</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Active Site</TableCell>
                          <TableCell>His124</TableCell>
                          <TableCell>Catalytic histidine</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Active Site</TableCell>
                          <TableCell>Glu98</TableCell>
                          <TableCell>Catalytic acid/base</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Binding Site</TableCell>
                          <TableCell>72-78</TableCell>
                          <TableCell>Substrate binding pocket</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    
                    <div className="bg-green-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Catalytic Mechanism</h4>
                      <p className="text-sm">This domain belongs to the α/β hydrolase fold and utilizes a catalytic triad (Ser-His-Glu) to catalyze the hydrolysis of ester bonds. The active site serine acts as a nucleophile, attacking the carbonyl carbon of the substrate to form a tetrahedral intermediate.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Taxonomy Tab */}
        <TabsContent value="taxonomy" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Taxonomic Context</CardTitle>
              <CardDescription>Evolutionary and taxonomic information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Taxonomic Classification</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="space-y-2">
                      <div className="grid grid-cols-[120px_auto] gap-2">
                        <div className="text-sm font-medium">Superkingdom:</div>
                        <div className="text-sm">{domainData.taxonomyInfo.superkingdom}</div>
                        
                        <div className="text-sm font-medium">Phylum:</div>
                        <div className="text-sm">{domainData.taxonomyInfo.phylum}</div>
                        
                        <div className="text-sm font-medium">Class:</div>
                        <div className="text-sm">{domainData.taxonomyInfo.class}</div>
                        
                        <div className="text-sm font-medium">Order:</div>
                        <div className="text-sm">{domainData.taxonomyInfo.order}</div>
                        
                        <div className="text-sm font-medium">Family:</div>
                        <div className="text-sm">{domainData.taxonomyInfo.family}</div>
                        
                        <div className="text-sm font-medium">Genus:</div>
                        <div className="text-sm">{domainData.taxonomyInfo.genus}</div>
                        
                        <div className="text-sm font-medium">Species:</div>
                        <div className="text-sm">{domainData.taxonomyInfo.scientific_name}</div>
                        
                        <div className="text-sm font-medium">Common Name:</div>
                        <div className="text-sm">{domainData.taxonomyInfo.common_name || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Evolutionary Context</h3>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Conservation</h4>
                      <p className="text-sm">
                        This domain is part of a widely conserved family of carboxylesterases found across eukaryotes. 
                        Within mammals, this domain shows high sequence conservation (>80% identity), indicating 
                        its functional importance in metabolic processes.
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Related Domains</h4>
                      <p className="text-sm mb-2">
                        Most closely related to other mammalian carboxylesterases with similar substrate specificities.
                      </p>
                      <div className="space-y-1">
                        <div className="text-xs">
                          • Acetylcholinesterase (60% similarity)
                        </div>
                        <div className="text-xs">
                          • Butyrylcholinesterase (55% similarity)
                        </div>
                        <div className="text-xs">
                          • Liver carboxylesterase (85% similarity)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium mb-2">Taxonomic Distribution in Cluster</h3>
                  <div className="bg-gray-100 rounded-md flex items-center justify-center p-4 h-48">
                    <div className="text-center text-gray-400">
                      <Info size={32} className="mx-auto mb-2" />
                      <p>Taxonomic distribution visualization would appear here</p>
                      <p className="text-xs mt-2">Showing how this domain is distributed across different taxonomic groups</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 flex justify-end">
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => alert('Domain data would be exported')}
        >
          <Download size={16} />
          <span>Export Domain Data</span>
        </button>
      </div>
    </Layout>
  );
};

export default DomainDetailPage;