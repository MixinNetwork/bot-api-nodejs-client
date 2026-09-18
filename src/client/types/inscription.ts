export type InscriptionMode = 1 | 2;

export interface InscriptionTreasury {
  ratio: string;
  recipient: string;
}

export interface InscriptionDeploy {
  version: 1;
  mode: InscriptionMode;
  supply: string;
  unit: string;
  symbol: string;
  name: string;
  icon: string;
  checksum?: string;
  treasury?: InscriptionTreasury;
}

export interface InscriptionInscribe {
  operation: 'inscribe';
  recipient: string;
  content?: string;
}

export interface InscriptionDistribute {
  /** the JSON key aligns with the Go SDK tag json:"distribute", the value must be the literal "distribute" */
  distribute: 'distribute';
  sequence: number;
}

export interface InscriptionOccupy {
  operation: 'occupy';
  sequence: number;
}

export type InscriptionOperation = InscriptionDeploy | InscriptionInscribe | InscriptionDistribute | InscriptionOccupy;
