// components/MSAViewer.tsx
import React, { useState, useEffect } from 'react';

interface MSAViewerProps {
  data: string;
  conservedPositions?: string;
  gapPositions?: string;
}

interface ParsedSequence {
  header: string;
  sequence: string;
  isRepresentative: boolean;
}

const MSAViewer: React.FC<MSAViewerProps> = ({ data, conservedPositions, gapPositions }) => {
  const [sequences, setSequences] = useState<ParsedSequence[]>([]);
  const [alignmentLength, setAlignmentLength] = useState(0);
  const [conservedArray, setConservedArray] = useState<number[]>([]);
  const [gapArray, setGapArray] = useState<number[]>([]);
  const [windowStart, setWindowStart] = useState(0);
  const [windowSize, setWindowSize] = useState(60); // Number of characters to show at once
  const [activeDomain, setActiveDomain] = useState<string | null>(null);

  useEffect(() => {
    // Parse the FASTA format
    if (!data) return;

    const lines = data.split('\n');
    const parsedSequences: ParsedSequence[] = [];
    let currentSequence = '';
    let currentHeader = '';
    
    for (const line of lines) {
      if (line.startsWith('>')) {
        if (currentHeader) {
          parsedSequences.push({
            header: currentHeader,
            sequence: currentSequence,
            isRepresentative: currentHeader.toLowerCase().includes('representative')
          });
          currentSequence = '';
        }
        currentHeader = line.slice(1).trim(); // Remove '>' character
      } else if (line.trim()) {
        currentSequence += line.trim();
      }
    }
    
    // Add the last sequence
    if (currentHeader) {
      parsedSequences.push({
        header: currentHeader,
        sequence: currentSequence,
        isRepresentative: currentHeader.toLowerCase().includes('representative')
      });
    }
    
    // Set alignment length based on the first sequence (they should all be the same)
    if (parsedSequences.length > 0) {
      setAlignmentLength(parsedSequences[0].sequence.length);
    }
    
    setSequences(parsedSequences);
    
    // Parse conserved positions
    if (conservedPositions) {
      setConservedArray(conservedPositions.split(',').map(Number));
    }
    
    // Parse gap positions
    if (gapPositions) {
      setGapArray(gapPositions.split(',').map(Number));
    }
  }, [data, conservedPositions, gapPositions]);

  // Handle next window
  const handleNext = () => {
    if (windowStart + windowSize < alignmentLength) {
      setWindowStart(windowStart + windowSize);
    }
  };

  // Handle previous window
  const handlePrev = () => {
    if (windowStart - windowSize >= 0) {
      setWindowStart(windowStart - windowSize);
    }
  };

  // Get CSS class for a specific position in the sequence
  const getPositionClass = (sequence: string, pos: number) => {
    // Check if it's a gap
    if (sequence[pos] === '-' || sequence[pos] === '.') {
      return 'bg-gray-200';
    }
    
    // Check if it's a conserved position
    if (conservedArray.includes(pos)) {
      return 'bg-blue-100 font-bold';
    }
    
    // Basic coloring by amino acid properties
    const aa = sequence[pos];
    
    // Hydrophobic residues
    if (['A', 'V', 'L', 'I', 'M', 'F', 'W', 'P'].includes(aa)) {
      return 'bg-yellow-100';
    }
    
    // Polar uncharged residues
    if (['G', 'S', 'T', 'C', 'Y', 'N', 'Q'].includes(aa)) {
      return 'bg-green-100';
    }
    
    // Polar positively charged residues
    if (['K', 'R', 'H'].includes(aa)) {
      return 'bg-red-100';
    }
    
    // Polar negatively charged residues
    if (['D', 'E'].includes(aa)) {
      return 'bg-purple-100';
    }
    
    return '';
  };

  return (
    <div className="border rounded overflow-hidden">
      {/* Navigation Controls */}
      <div className="flex items-center justify-between p-2 bg-gray-100 border-b">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={windowStart === 0}
            className="px-3 py-1 bg-blue-600 text-white rounded disabled:bg-gray-400"
          >
            &larr; Prev
          </button>
          <button
            onClick={handleNext}
            disabled={windowStart + windowSize >= alignmentLength}
            className="px-3 py-1 bg-blue-600 text-white rounded disabled:bg-gray-400"
          >
            Next &rarr;
          </button>
        </div>
        <div className="text-sm">
          Showing positions {windowStart + 1}-{Math.min(windowStart + windowSize, alignmentLength)} of {alignmentLength}
        </div>
      </div>
      
      {/* Legend */}
      <div className="p-2 bg-gray-50 border-b text-xs flex flex-wrap gap-2">
        <div className="flex items-center"><span className="inline-block w-3 h-3 mr-1 bg-blue-100"></span> Conserved</div>
        <div className="flex items-center"><span className="inline-block w-3 h-3 mr-1 bg-yellow-100"></span> Hydrophobic</div>
        <div className="flex items-center"><span className="inline-block w-3 h-3 mr-1 bg-green-100"></span> Polar</div>
        <div className="flex items-center"><span className="inline-block w-3 h-3 mr-1 bg-red-100"></span> Pos. Charged</div>
        <div className="flex items-center"><span className="inline-block w-3 h-3 mr-1 bg-purple-100"></span> Neg. Charged</div>
        <div className="flex items-center"><span className="inline-block w-3 h-3 mr-1 bg-gray-200"></span> Gap</div>
      </div>
      
      {/* Position Marker */}
      <div className="font-mono text-xs p-1 pl-40 overflow-x-auto whitespace-nowrap bg-gray-100 border-b">
        {Array.from({ length: Math.min(windowSize, alignmentLength - windowStart) }).map((_, i) => (
          <span key={i} className={`inline-block w-6 text-center ${(i + 1) % 10 === 0 ? 'font-bold' : ''}`}>
            {((i + windowStart) % 10)}
          </span>
        ))}
      </div>
      
      {/* Sequences */}
      <div className="overflow-auto max-h-96">
        {sequences.map((seq, index) => (
          <div 
            key={index} 
            className={`flex items-center hover:bg-gray-50 ${
              activeDomain === seq.header ? 'bg-blue-50' : seq.isRepresentative ? 'bg-yellow-50' : ''
            }`}
            onClick={() => setActiveDomain(activeDomain === seq.header ? null : seq.header)}
          >
            <div className="w-40 font-mono text-xs p-2 truncate border-r">
              {seq.header}
              {seq.isRepresentative && <span className="ml-1 text-blue-600">(Rep)</span>}
            </div>
            <div className="font-mono text-xs p-1 whitespace-nowrap overflow-x-auto">
              {seq.sequence.slice(windowStart, windowStart + windowSize).split('').map((char, pos) => (
                <span 
                  key={pos} 
                  className={`inline-block w-6 text-center ${getPositionClass(seq.sequence, pos + windowStart)}`}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Sequence Details (when clicked) */}
      {activeDomain && (
        <div className="p-3 bg-gray-50 border-t">
          <h4 className="text-sm font-bold">{activeDomain}</h4>
          <p className="text-xs mt-1">
            Click on a sequence row to see more details about the domain. This is where we would show 
            domain-specific information like structure links, functional annotations, etc.
          </p>
        </div>
      )}
    </div>
  );
};

export default MSAViewer;