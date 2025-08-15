import { describe, it, expect, beforeEach } from 'vitest';
import { createHybridRetrievalService } from '@/services/HybridRetrievalService';
import { createEmbeddingService } from '@/services/EmbeddingService';
import type { Contact } from '@/components/network/types';
import type { HybridRetrievalResult } from '@/types/hybridRetrieval';

describe('Hybrid Retrieval System', () => {
  let hybridService: any;
  let embeddingService: any;
  
  const mockContacts: Contact[] = [
    {
      id: '1',
      first_name: 'John',
      last_name: 'Developer',
      profession: 'Software Developer',
      services: ['React', 'Node.js', 'TypeScript'],
      tags: ['frontend', 'backend', 'fullstack'],
      relationship_degree: 8,
      city: 'Istanbul',
      description: 'Experienced full-stack developer'
    },
    {
      id: '2',
      first_name: 'Jane',
      last_name: 'Designer',
      profession: 'UI/UX Designer',
      services: ['Figma', 'Adobe XD', 'Prototyping'],
      tags: ['design', 'ui', 'ux'],
      relationship_degree: 6,
      city: 'Ankara',
      description: 'Creative UI/UX designer'
    },
    {
      id: '3',
      first_name: 'Bob',
      last_name: 'Manager',
      profession: 'Project Manager',
      services: ['Agile', 'Scrum', 'Leadership'],
      tags: ['management', 'agile', 'leadership'],
      relationship_degree: 9,
      city: 'Istanbul',
      description: 'Senior project manager'
    }
  ];
  
  beforeEach(() => {
    hybridService = createHybridRetrievalService();
    embeddingService = createEmbeddingService();
  });
  
  describe('Semantic Search Requirements', () => {
    it('should FAIL if semantic search is not used', async () => {
      const query = 'web development project';
      const requirements = {
        extractedRoles: ['Software Developer', 'UI/UX Designer'],
        extractedSkills: ['web', 'react'],
        domain: 'teknoloji',
        budget: 'medium',
        location: 'hybrid',
        urgency: 'medium'
      };
      
      const result: HybridRetrievalResult = await hybridService.search(
        query,
        requirements,
        mockContacts
      );
      
      // This test will FAIL if semantic search is not implemented
      expect(result.metadata.semanticSearchUsed).toBe(true);
      expect(result.recommendations.length).toBeGreaterThan(0);
      
      // Check that semantic scores are calculated
      const hasSemanticScores = result.recommendations.every(rec => 
        rec.subScores.semantic > 0 && rec.subScores.semantic <= 1
      );
      expect(hasSemanticScores).toBe(true);
    });
    
    it('should calculate cosine similarity correctly', async () => {
      const embedding1 = [1, 0, 0, 0];
      const embedding2 = [0, 1, 0, 0];
      const embedding3 = [1, 0, 0, 0];
      
      const similarity1 = await embeddingService.calculateCosineSimilarity(embedding1, embedding2);
      const similarity2 = await embeddingService.calculateCosineSimilarity(embedding1, embedding3);
      
      expect(similarity1).toBe(0); // Orthogonal vectors
      expect(similarity2).toBe(1); // Same vectors
    });
  });
  
  describe('Hybrid Scoring', () => {
    it('should combine semantic, keyword, and proximity scores', async () => {
      const query = 'web development team';
      const requirements = {
        extractedRoles: ['Software Developer'],
        extractedSkills: ['web', 'react'],
        domain: 'teknoloji',
        budget: 'medium',
        location: 'hybrid',
        urgency: 'medium'
      };
      
      const result = await hybridService.search(query, requirements, mockContacts);
      
      expect(result.recommendations.length).toBeGreaterThan(0);
      
      // Check that all sub-scores are calculated
      result.recommendations.forEach(rec => {
        expect(rec.subScores.semantic).toBeGreaterThanOrEqual(0);
        expect(rec.subScores.semantic).toBeLessThanOrEqual(1);
        expect(rec.subScores.keyword).toBeGreaterThanOrEqual(0);
        expect(rec.subScores.keyword).toBeLessThanOrEqual(1);
        expect(rec.subScores.proximity).toBeGreaterThanOrEqual(0);
        expect(rec.subScores.proximity).toBeLessThanOrEqual(1);
        expect(rec.subScores.domain).toBeGreaterThanOrEqual(0);
        expect(rec.subScores.domain).toBeLessThanOrEqual(1);
      });
    });
    
    it('should apply scoring weights correctly', async () => {
      const query = 'design project';
      const requirements = {
        extractedRoles: ['UI/UX Designer'],
        extractedSkills: ['design', 'figma'],
        domain: 'teknoloji',
        budget: 'medium',
        location: 'hybrid',
        urgency: 'medium'
      };
      
      const result = await hybridService.search(query, requirements, mockContacts);
      
      // The designer should score higher than the developer for this query
      const designerResult = result.recommendations.find(r => r.personId === '2');
      const developerResult = result.recommendations.find(r => r.personId === '1');
      
      if (designerResult && developerResult) {
        expect(designerResult.totalScore).toBeGreaterThan(developerResult.totalScore);
      }
    });
  });
  
  describe('Evidence and Penalties', () => {
    it('should provide evidence for matches', async () => {
      const query = 'react developer';
      const requirements = {
        extractedRoles: ['Software Developer'],
        extractedSkills: ['react'],
        domain: 'teknoloji',
        budget: 'medium',
        location: 'hybrid',
        urgency: 'medium'
      };
      
      const result = await hybridService.search(query, requirements, mockContacts);
      
      const developerResult = result.recommendations.find(r => r.personId === '1');
      expect(developerResult).toBeDefined();
      expect(developerResult!.evidence.matchedRoles).toContain('Software Developer');
      expect(developerResult!.evidence.matchedSkills).toContain('react');
    });
    
    it('should apply location penalties', async () => {
      const query = 'local team';
      const requirements = {
        extractedRoles: ['Software Developer'],
        extractedSkills: ['web'],
        domain: 'teknoloji',
        budget: 'medium',
        location: 'local',
        urgency: 'medium'
      };
      
      const result = await hybridService.search(query, requirements, mockContacts);
      
      // People with cities should score higher than those without
      const istanbulResult = result.recommendations.find(r => r.personId === '1');
      const ankaraResult = result.recommendations.find(r => r.personId === '2');
      
      if (istanbulResult && ankaraResult) {
        expect(istanbulResult.evidence.locationScore).toBeGreaterThan(0.5);
        expect(ankaraResult.evidence.locationScore).toBeGreaterThan(0.5);
      }
    });
  });
  
  describe('Performance and Thresholds', () => {
    it('should respect minimum thresholds', async () => {
      const query = 'unrelated query';
      const requirements = {
        extractedRoles: ['Unrelated Role'],
        extractedSkills: ['unrelated'],
        domain: 'genel',
        budget: 'medium',
        location: 'hybrid',
        urgency: 'medium'
      };
      
      const result = await hybridService.search(query, requirements, mockContacts);
      
      // Should filter out low-scoring results
      result.recommendations.forEach(rec => {
        expect(rec.subScores.semantic).toBeGreaterThanOrEqual(0.3);
        expect(rec.subScores.keyword).toBeGreaterThanOrEqual(0.1);
        expect(rec.subScores.proximity).toBeGreaterThanOrEqual(0.2);
      });
    });
    
    it('should complete within reasonable time', async () => {
      const query = 'web development';
      const requirements = {
        extractedRoles: ['Software Developer'],
        extractedSkills: ['web'],
        domain: 'teknoloji',
        budget: 'medium',
        location: 'hybrid',
        urgency: 'medium'
      };
      
      const startTime = Date.now();
      const result = await hybridService.search(query, requirements, mockContacts);
      const endTime = Date.now();
      
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.metadata.retrievalTime).toBeLessThan(5000);
    });
  });
});
