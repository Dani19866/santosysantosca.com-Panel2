import React, { useState } from 'react';
import { X, Package, DollarSign, Tag, Ruler, Shield, Factory, ShoppingCart } from 'lucide-react';
import { send_http_post } from '../../scripts/http.ts';
import { api_save_product } from "../../scripts/URL.ts"
import type { Category } from '../../interfaces/category.ts';
import type { Unit } from '../../interfaces/unit.ts';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  units: Unit[];
  isLoadingOptions: boolean;
  optionsError: string;
}

export default function AddProductModal({
  isOpen,
  onClose,
  categories,
  units,
  isLoadingOptions,
  optionsError
}: AddProductModalProps) {
  // Si el modal no está abierto, no renderizamos nada
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: '',
    internal_code: '',
    category: '',
    unit: '',
    is_manufactured: false,
    is_purchased: false,
    cost_value: 0,
    safety_stock_level: 0
  });

  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    internal_code: false,
    category: false,
    unit: false,
    product_type: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = {
      name: formData.name.trim() === '',
      internal_code: formData.internal_code.trim() === '',
      category: formData.category.trim() === '',
      unit: formData.unit.trim() === '',
      product_type: !formData.is_manufactured && !formData.is_purchased
    };

    setFieldErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    // Validar que al menos una opción esté seleccionada
    if (!formData.is_manufactured && !formData.is_purchased) return;

    // Enviamos la solicitud HTTP POST
    try {
      const response = await send_http_post(api_save_product, formData);
      console.log("Producto añadido correctamente: ", response)

    } catch (error) {

    }

    // onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-linear-to-r from-[#1e11d9] to-[#003D9D] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Package className="size-6 text-white" strokeWidth={2.5} />
            </div>
            <h2 className="font-['Inter:Bold',sans-serif] font-bold text-[20px] text-white">
              Agregar Nuevo Producto
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="size-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Información Básica */}
            <div>
              <h3 className="font-['Inter:Bold',sans-serif] font-bold text-[14px] text-[#363636] mb-4 uppercase tracking-wide">
                Información Básica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div className="md:col-span-2">
                  <label className="block font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#363636] mb-2">
                    Nombre del Producto *
                  </label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF]" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: false });
                      }}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${fieldErrors.name
                        ? 'border-[#DC2626] focus:ring-[#DC2626]'
                        : 'border-[#E5E7EB] focus:ring-[#1e11d9]'
                        }`}
                      placeholder="Ej: BISAGRA ARMILLAR 2 PULGADAS"
                    />
                  </div>
                  {fieldErrors.name && (
                    <p className="mt-1 text-[11px] text-[#DC2626]">Rellena este campo por favor</p>
                  )}
                </div>

                {/* Código Interno */}
                <div>
                  <label className="block font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#363636] mb-2">
                    Código Interno *
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF]" />
                    <input
                      type="text"
                      required
                      value={formData.internal_code}
                      onChange={(e) => {
                        setFormData({ ...formData, internal_code: e.target.value });
                        if (fieldErrors.internal_code) setFieldErrors({ ...fieldErrors, internal_code: false });
                      }}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${fieldErrors.internal_code
                        ? 'border-[#DC2626] focus:ring-[#DC2626]'
                        : 'border-[#E5E7EB] focus:ring-[#1e11d9]'
                        }`}
                      placeholder="Ej: PROD-001"
                    />
                  </div>
                  {fieldErrors.internal_code && (
                    <p className="mt-1 text-[11px] text-[#DC2626]">Rellena este campo por favor</p>
                  )}
                </div>

                {/* Costo */}
                <div>
                  <label className="block font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#363636] mb-2">
                    Costo (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF]" />
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.cost_value}
                      onChange={(e) => setFormData({ ...formData, cost_value: parseFloat(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e11d9] focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Clasificación */}
            <div>
              <h3 className="font-['Inter:Bold',sans-serif] font-bold text-[14px] text-[#363636] mb-4 uppercase tracking-wide">
                Clasificación
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Categoría */}
                <div>
                  <label className="block font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#363636] mb-2">
                    Categoría *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => {
                      setFormData({ ...formData, category: e.target.value });
                      if (fieldErrors.category) setFieldErrors({ ...fieldErrors, category: false });
                    }}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white ${fieldErrors.category
                      ? 'border-[#DC2626] focus:ring-[#DC2626]'
                      : 'border-[#E5E7EB] focus:ring-[#1e11d9]'
                      }`}
                  >
                    <option value="">Seleccionar categoría</option>
                    {isLoadingOptions && <option value="" disabled>Cargando categorías...</option>}
                    {!isLoadingOptions && categories.map((item) => (
                      <option key={item.id} value={item.category}>{item.category}</option>
                    ))}
                  </select>
                  {fieldErrors.category && (
                    <p className="mt-1 text-[11px] text-[#DC2626]">Rellena este campo por favor</p>
                  )}
                  {!isLoadingOptions && !optionsError && categories.length === 0 && (
                    <p className="mt-1 text-[11px] text-[#9CA3AF]">No hay categorías disponibles</p>
                  )}
                </div>

                {/* Unidad de Medida */}
                <div>
                  <label className="block font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#363636] mb-2">
                    Unidad de Medida *
                  </label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF] pointer-events-none" />
                    <select
                      required
                      value={formData.unit}
                      onChange={(e) => {
                        setFormData({ ...formData, unit: e.target.value });
                        if (fieldErrors.unit) setFieldErrors({ ...fieldErrors, unit: false });
                      }}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white appearance-none ${fieldErrors.unit
                        ? 'border-[#DC2626] focus:ring-[#DC2626]'
                        : 'border-[#E5E7EB] focus:ring-[#1e11d9]'
                        }`}
                    >
                      <option value="">Seleccionar unidad</option>
                      {isLoadingOptions && <option value="" disabled>Cargando unidades...</option>}
                      {!isLoadingOptions && units.map((item) => (
                        <option key={item.id} value={item.unit}>{item.unit}</option>
                      ))}
                    </select>
                  </div>
                  {fieldErrors.unit && (
                    <p className="mt-1 text-[11px] text-[#DC2626]">Rellena este campo por favor</p>
                  )}
                  {!isLoadingOptions && !optionsError && units.length === 0 && (
                    <p className="mt-1 text-[11px] text-[#9CA3AF]">No hay unidades disponibles</p>
                  )}
                </div>
              </div>
              {optionsError && (
                <p className="mt-2 text-[11px] text-[#DC2626]">{optionsError}</p>
              )}
            </div>

            {/* Tipo de Producto */}
            <div>
              <h3 className="font-['Inter:Bold',sans-serif] font-bold text-[14px] text-[#363636] mb-4 uppercase tracking-wide">
                Tipo de Producto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Se puede fabricar */}
                <label className={`flex items-center gap-3 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${formData.is_manufactured
                  ? 'border-[#1e11d9] bg-[#1e11d9]/5'
                  : 'border-[#E5E7EB] hover:border-[#1e11d9]/50'
                  }`}>
                  <input
                    type="checkbox"
                    checked={formData.is_manufactured}
                    onChange={(e) => {
                      setFormData({ ...formData, is_manufactured: e.target.checked });
                      if (fieldErrors.product_type && (e.target.checked || formData.is_purchased)) {
                        setFieldErrors({ ...fieldErrors, product_type: false });
                      }
                    }}
                    className="size-5 text-[#1e11d9] focus:ring-[#1e11d9] rounded"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <Factory className="size-4 text-[#1e11d9]" strokeWidth={2.5} />
                    <span className="font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#363636]">
                      Se puede fabricar
                    </span>
                  </div>
                </label>

                {/* Se puede comprar */}
                <label className={`flex items-center gap-3 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${formData.is_purchased
                  ? 'border-[#10c507] bg-[#10c507]/5'
                  : 'border-[#E5E7EB] hover:border-[#10c507]/50'
                  }`}>
                  <input
                    type="checkbox"
                    checked={formData.is_purchased}
                    onChange={(e) => {
                      setFormData({ ...formData, is_purchased: e.target.checked });
                      if (fieldErrors.product_type && (e.target.checked || formData.is_manufactured)) {
                        setFieldErrors({ ...fieldErrors, product_type: false });
                      }
                    }}
                    className="size-5 text-[#10c507] focus:ring-[#10c507] rounded"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <ShoppingCart className="size-4 text-[#10c507]" strokeWidth={2.5} />
                    <span className="font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#363636]">
                      Se puede comprar
                    </span>
                  </div>
                </label>
              </div>
              <p className="mt-2 font-['Inter:Medium',sans-serif] font-medium text-[11px] text-[#9CA3AF]">
                * Puede seleccionar una o ambas opciones
              </p>
              {fieldErrors.product_type && (
                <p className="mt-1 text-[11px] text-[#DC2626]">Rellena este campo por favor</p>
              )}
            </div>

            {/* Reglas de inventario */}
            <div>
              <h3 className="font-['Inter:Bold',sans-serif] font-bold text-[14px] text-[#363636] mb-4 uppercase tracking-wide">
                Reglas de Inventario
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {/* Nivel de inventario seguro */}
                <div>
                  <label className="block font-['Inter:Medium',sans-serif] font-medium text-[13px] text-[#363636] mb-2">
                    Nivel de inventario seguro
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF]" />
                    <input
                      type="number"
                      required
                      value={formData.safety_stock_level}
                      onChange={(e) => setFormData({ ...formData, safety_stock_level: parseFloat(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e11d9] focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <p className="mt-2 font-['Inter:Medium',sans-serif] font-medium text-[11px] text-[#9CA3AF]">
                    Define el nivel mínimo de stock recomendado para este producto
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-[#E5E7EB] px-6 py-4 flex items-center justify-end gap-3 bg-[#F9FAFB]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-[#E5E7EB] rounded-lg font-['Inter:Bold',sans-serif] font-bold text-[13px] text-[#363636] hover:bg-[#E5E7EB] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-linear-to-r from-[#1e11d9] to-[#003D9D] rounded-lg font-['Inter:Bold',sans-serif] font-bold text-[13px] text-white hover:shadow-lg transition-all hover:scale-105"
          >
            Guardar Producto
          </button>
        </div>
      </div>
    </div>
  );
}