/**
 * Interfaz para representar el costo histórico de un producto
 * 
 * Este histórico representa el dato "cost_history" en la base de datos
 * que es de tipo JSONB
 */
export interface CostHistory {
    date: string;
    description: string;
    cost: number;
}

/**
 * Interfaz para representar un producto en el sistema
 * 
 */
export interface Product {
    id: string;
    name: string;
    internalCode: string;
    category: string;
    unit: string;
    cost: number;
    currentStock: number;
    safetyStock: number;
    isPurchased: boolean;
    isManufactured: boolean;
    costHistory: CostHistory[];

    //   No ha sido implementado aún
    imageUrl?: string;
}