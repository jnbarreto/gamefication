export type EvidenceRecord = {
  id: string;
  entityType: string;
  entityId: string;
  type: string;
  value: string;
  description: string | null;
  createdAt: Date;
};

export default interface EvidenceRepository {
  findByEntities(entityType: string, entityIds: string[]): Promise<Map<string, EvidenceRecord>>;
  findByEntity(entityType: string, entityId: string): Promise<EvidenceRecord | null>;
}
