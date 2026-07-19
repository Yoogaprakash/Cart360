export interface Unit {
  id: string;
  name: string;
  shortCode: string;
  isActive: boolean;
}

export interface CreateUnitRequest {
  name: string;
  shortCode: string;
}

export interface UpdateUnitRequest extends CreateUnitRequest {
  isActive: boolean;
}
