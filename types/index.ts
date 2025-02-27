async getDomainStructure(domainId: number): Promise<StructureFile[]> {
  try {
    const response = await fetch(`${BASE_API_URL}/structures/domain/${domainId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch structures for domain ${domainId}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching structures for domain ${domainId}:`, error);
    throw error;
  }
},

async getProteinStructure(unpAcc: string): Promise<StructureFile[]> {
  try {
    const response = await fetch(`${BASE_API_URL}/structures/protein/${unpAcc}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch structures for protein ${unpAcc}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching structures for protein ${unpAcc}:`, error);
    throw error;
  }
},

async getStructureById(structureId: number): Promise<StructureViewerData> {
  try {
    const response = await fetch(`${BASE_API_URL}/structures/${structureId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch structure with ID ${structureId}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching structure with ID ${structureId}:`, error);
    throw error;
  }
},

async getStructureFile(filePath: string): Promise<Blob> {
  try {
    const response = await fetch(`${BASE_API_URL}/structures/file?path=${encodeURIComponent(filePath)}`, {
      headers: {
        'Accept': 'application/octet-stream'
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch structure file at ${filePath}`);
    }
    return response.blob();
  } catch (error) {
    console.error(`Error fetching structure file at ${filePath}:`, error);
    throw error;
  }
},

async compareStructures(structureId1: number, structureId2: number): Promise<StructureComparisonData> {
  try {
    const response = await fetch(`${BASE_API_URL}/structures/compare?ref=${structureId1}&target=${structureId2}`);
    if (!response.ok) {
      throw new Error(`Failed to compare structures ${structureId1} and ${structureId2}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error comparing structures ${structureId1} and ${structureId2}:`, error);
    throw error;
  }
},

async getClusterStructuralAlignment(clusterId: number): Promise<{
  representative_structure_id: number,
  aligned_structures: Array<{
    structure_id: number,
    domain_id: number,
    tm_score: number,
    rmsd: number
  }>
}> {
  try {
    const response = await fetch(`${BASE_API_URL}/clusters/${clusterId}/structural-alignment`);
    if (!response.ok) {
      throw new Error(`Failed to fetch structural alignment for cluster ${clusterId}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching structural alignment for cluster ${clusterId}:`, error);
    throw error;
  }
},

async getStructureQualityAssessment(structureId: number): Promise<{
  plddt_scores?: number[],
  clash_score?: number,
  ramachandran_outliers?: number,
  sidechain_outliers?: number,
  overall_quality: 'excellent' | 'good' | 'fair' | 'poor'
}> {
  try {
    const response = await fetch(`${BASE_API_URL}/structures/${structureId}/quality`);
    if (!response.ok) {
      throw new Error(`Failed to fetch quality assessment for structure ${structureId}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching quality assessment for structure ${structureId}:`, error);
    throw error;
  }
}