/**
 * ReferenceBookForm Component
 * 
 * Reusable form component for creating and editing reference books (справочники).
 * Supports dynamic fields, validation, and AI-agent suggestions.
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date';
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: Array<{ value: string | number; label: string }>;
  validation?: (value: any) => string | null;
  aiSuggestion?: string;
}

export interface ReferenceBookFormProps {
  type: 'location' | 'category' | 'unit' | 'machineType' | 'componentType' | 'taskType' | 'supplierType';
  title: string;
  description?: string;
  fields: FormField[];
  initialData?: Record<string, any>;
  isLoading?: boolean;
  isSubmitting?: boolean;
  showAiSuggestions?: boolean;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onCancel?: () => void;
}

export function ReferenceBookForm({
  type,
  title,
  description,
  fields,
  initialData = {},
  isLoading = false,
  isSubmitting = false,
  showAiSuggestions = false,
  onSubmit,
  onCancel,
}: ReferenceBookFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [aiSuggestionsVisible, setAiSuggestionsVisible] = useState(false);

  // Initialize form data
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Validate single field
  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && !value) {
      return `${field.label} обязательно`;
    }

    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Некорректный email';
      }
    }

    if (field.type === 'phone' && value) {
      const phoneRegex = /^\+?998\d{9}$/;
      if (!phoneRegex.test(value.replace(/\D/g, ''))) {
        return 'Некорректный номер телефона (+998...)';
      }
    }

    if (field.validation) {
      return field.validation(value);
    }

    return null;
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field change
  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Handle field blur
  const handleFieldBlur = (fieldName: string) => {
    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));

    const field = fields.find((f) => f.name === fieldName);
    if (field) {
      const error = validateField(field, formData[fieldName]);
      if (error) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: error,
        }));
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    try {
      await onSubmit(formData);
      toast.success(`${title} успешно сохранено`);
    } catch (error) {
      toast.error(`Ошибка при сохранении: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Render form field
  const renderField = (field: FormField) => {
    const value = formData[field.name] ?? '';
    const error = errors[field.name];
    const isTouched = touched[field.name];
    const showError = isTouched && error;

    const fieldClasses =
      'bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <Label className="text-slate-200">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </Label>
            <Input
              type={field.type === 'phone' ? 'tel' : field.type}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              onBlur={() => handleFieldBlur(field.name)}
              disabled={isLoading || isSubmitting}
              className={fieldClasses}
            />
            {field.description && <p className="text-xs text-slate-400">{field.description}</p>}
            {showError && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label className="text-slate-200">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </Label>
            <Textarea
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              onBlur={() => handleFieldBlur(field.name)}
              disabled={isLoading || isSubmitting}
              className={`${fieldClasses} min-h-24`}
            />
            {field.description && <p className="text-xs text-slate-400">{field.description}</p>}
            {showError && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label className="text-slate-200">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </Label>
            <Select
              value={String(value)}
              onValueChange={(val) => handleFieldChange(field.name, val)}
              disabled={isLoading || isSubmitting}
            >
              <SelectTrigger className={fieldClasses}>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)} className="text-white">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.description && <p className="text-xs text-slate-400">{field.description}</p>}
            {showError && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="flex items-center space-x-3">
            <Checkbox
              id={field.name}
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
              disabled={isLoading || isSubmitting}
              className="border-white/20"
            />
            <Label htmlFor={field.name} className="text-slate-200 cursor-pointer">
              {field.label}
            </Label>
            {field.description && <p className="text-xs text-slate-400">{field.description}</p>}
          </div>
        );

      case 'date':
        return (
          <div key={field.name} className="space-y-2">
            <Label className="text-slate-200">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </Label>
            <Input
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              onBlur={() => handleFieldBlur(field.name)}
              disabled={isLoading || isSubmitting}
              className={fieldClasses}
            />
            {field.description && <p className="text-xs text-slate-400">{field.description}</p>}
            {showError && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
        {description && <CardDescription className="text-slate-400">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* AI Suggestions Banner */}
          {showAiSuggestions && aiSuggestionsVisible && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-blue-400">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">AI Предложения</span>
              </div>
              <div className="space-y-2">
                {fields
                  .filter((f) => f.aiSuggestion)
                  .map((f) => (
                    <div key={f.name} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{f.label}:</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFieldChange(f.name, f.aiSuggestion)}
                        className="text-blue-400 hover:bg-blue-500/20"
                      >
                        {f.aiSuggestion}
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field) => renderField(field))}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-6 border-t border-white/10">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading || isSubmitting}
                className="border-white/10 text-white hover:bg-white/5"
              >
                Отмена
              </Button>
            )}

            {showAiSuggestions && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setAiSuggestionsVisible(!aiSuggestionsVisible)}
                disabled={isLoading || isSubmitting}
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {aiSuggestionsVisible ? 'Скрыть' : 'Показать'} AI
              </Button>
            )}

            <Button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default ReferenceBookForm;
