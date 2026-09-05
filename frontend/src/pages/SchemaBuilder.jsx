import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Trash2, Settings2 } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { toast } from 'react-hot-toast';

const FIELD_TYPES = [
  'string', 'number', 'integer', 'boolean', 'date', 
  'email', 'url', 'enum', 'array', 'object', 'reference', 'decimal'
];

export default function SchemaBuilder({ onSave, initialFields = [], collections = [] }) {
  const [fields, setFields] = useState(
    initialFields.map(f => ({ ...f, _id: f._id || Math.random().toString(36).substr(2, 9) }))
  );
  
  // To handle which field's settings are expanded
  const [expandedFieldId, setExpandedFieldId] = useState(null);

  const addField = () => {
    setFields([...fields, { 
      _id: Math.random().toString(36).substr(2, 9), 
      name: '', 
      type: 'string', 
      required: false 
    }]);
  };

  const removeField = (id) => {
    setFields(fields.filter(f => f._id !== id));
  };

  const updateField = (id, key, value) => {
    setFields(fields.map(f => f._id === id ? { ...f, [key]: value } : f));
  };

  const handleSave = () => {
    // Validate
    if (fields.length === 0) {
      toast.error('Schema must have at least one field');
      return;
    }
    const hasEmptyName = fields.some(f => !f.name.trim());
    if (hasEmptyName) {
      toast.error('All fields must have a name');
      return;
    }
    
    // Clean up fields before sending (remove _id if it's the temp one we added)
    const cleanFields = fields.map(f => {
      const { _id, ...rest } = f;
      // Convert enumValues from string to array if needed
      if (rest.type === 'enum' && typeof rest.enumValues === 'string') {
        rest.enumValues = rest.enumValues.split(',').map(s => s.trim()).filter(Boolean);
      }
      return rest;
    });

    onSave(cleanFields);
  };

  return (
    <div className="space-y-4">
      {fields.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground bg-zinc-950/50 rounded-lg border border-dashed border-zinc-800">
          No fields defined yet.
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field._id} className="border border-zinc-800 rounded-lg bg-zinc-950 overflow-hidden">
              <div className="flex items-center p-3 gap-3 bg-zinc-900/50">
                <Input 
                  className="w-1/3 bg-background" 
                  placeholder="Field Name" 
                  value={field.name}
                  onChange={(e) => updateField(field._id, 'name', e.target.value)}
                />
                
                <select 
                  className="flex h-9 w-1/4 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={field.type}
                  onChange={(e) => updateField(field._id, 'type', e.target.value)}
                >
                  {FIELD_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm flex items-center gap-1 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-zinc-700 bg-zinc-900"
                      checked={field.required || false}
                      onChange={(e) => updateField(field._id, 'required', e.target.checked)}
                    />
                    Required
                  </label>
                  {field.required && <Badge variant="secondary" className="scale-75 origin-left">req</Badge>}
                </div>

                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setExpandedFieldId(expandedFieldId === field._id ? null : field._id)}>
                    <Settings2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeField(field._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {expandedFieldId === field._id && (
                <div className="p-4 border-t border-zinc-800 bg-zinc-950 grid grid-cols-2 gap-4">
                  
                  {/* Default Value */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Default Value</label>
                    <Input 
                      placeholder="e.g. 0, 'test', true" 
                      className="h-8"
                      value={field.default || ''}
                      onChange={(e) => updateField(field._id, 'default', e.target.value)}
                    />
                  </div>

                  {/* Enum Values */}
                  {field.type === 'enum' && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Enum Values (comma separated)</label>
                      <Input 
                        placeholder="red, green, blue" 
                        className="h-8"
                        value={Array.isArray(field.enumValues) ? field.enumValues.join(', ') : (field.enumValues || '')}
                        onChange={(e) => updateField(field._id, 'enumValues', e.target.value)}
                      />
                    </div>
                  )}

                  {/* Reference Collection */}
                  {field.type === 'reference' && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Reference Collection Slug</label>
                      <select 
                        className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={field.refCollection || ''}
                        onChange={(e) => updateField(field._id, 'refCollection', e.target.value)}
                      >
                        <option value="">Select a collection...</option>
                        {collections.map(c => (
                          <option key={c._id} value={c.slug}>{c.name} (/{c.slug})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Array Type */}
                  {field.type === 'array' && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Items Type</label>
                      <select 
                        className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={field.arrayType || 'string'}
                        onChange={(e) => updateField(field._id, 'arrayType', e.target.value)}
                      >
                        {FIELD_TYPES.filter(t => t !== 'array').map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Min / Max for numbers */}
                  {['number', 'integer', 'decimal'].includes(field.type) && (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Min</label>
                        <Input 
                          type="number" className="h-8"
                          value={field.min ?? ''}
                          onChange={(e) => updateField(field._id, 'min', e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Max</label>
                        <Input 
                          type="number" className="h-8"
                          value={field.max ?? ''}
                          onChange={(e) => updateField(field._id, 'max', e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </div>
                    </>
                  )}

                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={addField} type="button" className="gap-2">
          <Plus className="h-4 w-4" /> Add Field
        </Button>
        <Button onClick={handleSave}>
          Save Schema
        </Button>
      </div>
    </div>
  );
}
