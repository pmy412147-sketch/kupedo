'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CategoryField, getFieldSections } from '@/lib/category-fields';

interface CategorySpecificFieldsProps {
  fields: CategoryField[];
  values: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
}

export function CategorySpecificFields({ fields, values, onChange }: CategorySpecificFieldsProps) {
  if (fields.length === 0) return null;

  const sections = getFieldSections(fields);
  const fieldsWithoutSection = fields.filter(f => !f.section);
  const fieldsBySection = sections.reduce((acc, section) => {
    acc[section] = fields.filter(f => f.section === section);
    return acc;
  }, {} as Record<string, CategoryField[]>);

  const renderField = (field: CategoryField) => {
    const value = values[field.id] || '';

    switch (field.type) {
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(v) => onChange(field.id, v)}
            >
              <SelectTrigger id={field.id} className="h-11">
                <SelectValue placeholder={`Vyberte ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.unit && `(${field.unit})`} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.id}
              type="number"
              value={value}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              className="h-11"
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.id}
              value={value}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="min-h-[100px]"
            />
          </div>
        );

      case 'text':
      default:
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.id}
              type="text"
              value={value}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="h-11"
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-3">
        Špecifické informácie
      </h3>

      {/* Fields without section */}
      {fieldsWithoutSection.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fieldsWithoutSection.map(renderField)}
        </div>
      )}

      {/* Fields grouped by section */}
      {sections.map((section) => (
        <div key={section} className="space-y-4">
          <h4 className="text-base font-semibold text-gray-700 border-b pb-2">
            {section}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fieldsBySection[section].map(renderField)}
          </div>
        </div>
      ))}
    </div>
  );
}
