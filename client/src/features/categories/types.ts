export interface Category {
  id: string;
  parentCategoryId?: string | null;
  parentCategoryName?: string | null;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface CreateCategoryRequest {
  parentCategoryId?: string | null;
  name: string;
  description?: string | null;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {
  isActive: boolean;
}
