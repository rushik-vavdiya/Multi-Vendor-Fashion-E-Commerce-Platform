import { useState } from 'react';
import { Plus, Trash2, Wand2 } from 'lucide-react';

import Button from '../common/Button';

// A product can use at most three variant types, for example
// Color, Size and Material.
const MAX_VARIANTS = 3;
const CUSTOM_OPTION = '__custom_option__';
const CUSTOM_VARIANT = '__custom_variant__';

const VARIANT_TYPES = ['Color', 'Size', 'Material'];

const PRESET_OPTIONS = {
  color: [
    'Black', 'White', 'Gray', 'Silver', 'Charcoal', 'Red', 'Maroon', 'Burgundy',
    'Pink', 'HotPink', 'Coral', 'Salmon', 'Orange', 'PeachPuff', 'Yellow', 'Gold',
    'Beige', 'Tan', 'Brown', 'Chocolate', 'Khaki', 'Olive', 'Green', 'Lime',
    'MintCream', 'Teal', 'Turquoise', 'Cyan', 'SkyBlue', 'Blue', 'Navy', 'RoyalBlue',
    'Indigo', 'Purple', 'Violet', 'Lavender', 'Plum', 'Magenta', 'Cream', 'Ivory',
    'Off White', 'Rose', 'Rust', 'Mustard', 'Sage', 'Emerald', 'Multicolor',
  ],
  size: [
    'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL',
    'One Size', '28', '30', '32', '34', '36', '38', '40', '42', '44',
    'EU 36', 'EU 37', 'EU 38', 'EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43',
  ],
  material: [
    'Cotton', 'Organic Cotton', 'Linen', 'Silk', 'Wool', 'Cashmere', 'Denim',
    'Leather', 'Faux Leather', 'Suede', 'Polyester', 'Nylon', 'Viscose', 'Rayon',
    'Modal', 'Tencel', 'Acrylic', 'Jute', 'Hemp', 'Velvet', 'Satin', 'Chiffon',
    'Lace', 'Canvas', 'Bamboo', 'Blended Fabric',
  ],
};

const normalizeType = (name) => String(name ?? '').trim().toLowerCase();
const optionsFor = (name) => PRESET_OPTIONS[normalizeType(name)] ?? [];

// Turns "Red, Blue , Green" into ["Red", "Blue", "Green"].
const toOptions = (text) =>
  String(text ?? '')
    .split(',')
    .map((option) => option.trim())
    .filter(Boolean);

// Every combination of the variant options, in order. For Color × Size it
// returns [[Red, S], [Red, M], [Blue, S], [Blue, M]].
const cartesian = (lists) =>
  lists.reduce((rows, options) => rows.flatMap((row) => options.map((option) => [...row, option])), [[]]);

// Keeps only the fields the API accepts, so a saved combination keeps its _id
// (and therefore its images) while new ones are created fresh.
const cleanCombination = (combination) => ({
  ...(combination._id ? { _id: combination._id } : {}),
  variantName: String(combination.variantName ?? '').trim(),
  price: Number(combination.price) || 0,
  stock: Number.isInteger(Number(combination.stock)) ? Number(combination.stock) : 0,
  ...(String(combination.sku ?? '').trim() ? { sku: String(combination.sku).trim() } : {}),
  ...(combination.comarePrice !== '' && combination.comarePrice !== undefined && combination.comarePrice !== null
    ? { comarePrice: Number(combination.comarePrice) }
    : {}),
});

const readVariants = (rows) =>
  rows
    .map((row) => ({ name: row.name.trim(), options: toOptions(row.optionsText) }))
    .filter((variant) => variant.name && variant.options.length > 0);

// Reusable variant builder shared by the admin and vendor product forms.
export default function VariantEditor({
  variants: initialVariants = [],
  combinations: initialCombinations = [],
  basePrice = 0,
  baseStock = 0,
  onChange,
}) {
  const [rows, setRows] = useState(() =>
    (initialVariants ?? []).map((variant) => ({
      name: variant.name ?? '',
      optionsText: (variant.options ?? []).join(', '),
      addingCustom: false,
      draftOption: '',
    })),
  );
  const [combinations, setCombinations] = useState(initialCombinations ?? []);

  const emit = (nextRows, nextCombinations) =>
    onChange?.({
      variants: readVariants(nextRows),
      variantCombinations: nextCombinations.map(cleanCombination).filter((item) => item.variantName),
    });

  // (Re)builds the combination list from the variant rows, keeping any
  // combination the user has already edited when its name still matches.
  const regenerate = (nextRows, current = combinations) => {
    const variants = readVariants(nextRows);
    if (variants.length === 0) {
      setCombinations([]);
      emit(nextRows, []);
      return;
    }

    const generated = cartesian(variants.map((variant) => variant.options)).map((options) => {
      const variantName = options.join(' / ');
      return (
        current.find((item) => item.variantName === variantName) ?? {
          variantName,
          price: basePrice || 0,
          stock: baseStock || 0,
          sku: '',
          comarePrice: '',
        }
      );
    });

    setCombinations(generated);
    emit(nextRows, generated);
  };

  const updateVariant = (index, field, value) => {
    const nextRows = rows.map((row, rowIndex) =>
      rowIndex === index ? { ...row, [field]: value } : row,
    );
    setRows(nextRows);
    regenerate(nextRows);
  };

  const addOption = (index, value) => {
    const option = String(value ?? '').trim();
    if (!option) return;

    const nextRows = rows.map((row, rowIndex) => {
      if (rowIndex !== index) return row;
      const options = toOptions(row.optionsText);
      if (!options.some((existing) => existing.toLowerCase() === option.toLowerCase())) {
        options.push(option);
      }
      return {
        ...row,
        optionsText: options.join(', '),
        addingCustom: false,
        draftOption: '',
      };
    });
    setRows(nextRows);
    regenerate(nextRows);
  };

  const removeOption = (rowIndex, optionIndex) => {
    const nextRows = rows.map((row, index) =>
      index === rowIndex
        ? { ...row, optionsText: toOptions(row.optionsText).filter((_, itemIndex) => itemIndex !== optionIndex).join(', ') }
        : row,
    );
    setRows(nextRows);
    regenerate(nextRows);
  };

  const atVariantLimit = rows.length >= MAX_VARIANTS;

  const addVariant = () => {
    if (atVariantLimit) return;

    const nextRows = [...rows, { name: '', optionsText: '', addingCustom: false, draftOption: '' }];
    setRows(nextRows);
  };

  const removeVariant = (index) => {
    const nextRows = rows.filter((_, rowIndex) => rowIndex !== index);
    setRows(nextRows);
    regenerate(nextRows);
  };

  const updateCombination = (index, field, value) => {
    const next = combinations.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item,
    );
    setCombinations(next);
    emit(rows, next);
  };

  const addCombination = () => {
    const next = [
      ...combinations,
      { variantName: '', price: basePrice || 0, stock: baseStock || 0, sku: '', comarePrice: '' },
    ];
    setCombinations(next);
    emit(rows, next);
  };

  const removeCombination = (index) => {
    const next = combinations.filter((_, itemIndex) => itemIndex !== index);
    setCombinations(next);
    emit(rows, next);
  };

  const inputClass =
    'min-h-10 w-full rounded-xl border border-border bg-white px-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15';

  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-border bg-background p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-primary">Variants</h3>
          <p className="mt-0.5 text-xs text-muted">
            Choose colors, sizes or materials from the available options, or add
            your own. Combinations are generated for you below.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={addVariant}
          disabled={atVariantLimit}
        >
          <Plus size={15} strokeWidth={1.9} aria-hidden="true" />
          {atVariantLimit ? `All ${MAX_VARIANTS} variant types added` : 'Add variant'}
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-white px-4 py-4 text-xs text-muted">
          No variants yet. A product without variants is a single price and stock,
          which is fine too.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((row, index) => {
            const knownType = VARIANT_TYPES.find(
              (type) => type.toLowerCase() === normalizeType(row.name),
            );
            const selectedOptions = toOptions(row.optionsText);
            const presetOptions = optionsFor(row.name);

            return (
            <li key={index} className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-3 sm:p-4">
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <div className="flex flex-col gap-2">
                  <select
                    value={knownType ?? (row.name ? CUSTOM_VARIANT : '')}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (value === CUSTOM_VARIANT) {
                        setRows((current) =>
                          current.map((item, rowIndex) =>
                            rowIndex === index ? { ...item, name: '', addingCustom: false } : item,
                          ),
                        );
                      } else {
                        updateVariant(index, 'name', value);
                      }
                    }}
                    aria-label={`Variant ${index + 1} type`}
                    className={inputClass}
                  >
                    <option value="" disabled>Select a variant type…</option>
                    {VARIANT_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                    <option value={CUSTOM_VARIANT}>Custom variant type…</option>
                  </select>

                  {!knownType && (
                    <input
                      value={row.name}
                      onChange={(event) => updateVariant(index, 'name', event.target.value)}
                      placeholder="Enter a variant type"
                      aria-label={`Custom variant ${index + 1} name`}
                      className={inputClass}
                    />
                  )}
                </div>

              <button
                type="button"
                onClick={() => removeVariant(index)}
                aria-label={`Remove variant ${index + 1}`}
                className="flex min-h-10 items-center justify-center rounded-xl border border-red-200 bg-white px-3 text-red-700 transition-colors hover:bg-red-50"
              >
                <Trash2 size={15} strokeWidth={1.9} aria-hidden="true" />
              </button>

              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor={`variant-option-${index}`} className="text-xs font-medium text-primary">
                  {row.name || 'Variant'} options
                </label>
                <select
                  id={`variant-option-${index}`}
                  value=""
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === CUSTOM_OPTION) {
                      setRows((current) =>
                        current.map((item, rowIndex) =>
                          rowIndex === index ? { ...item, addingCustom: true } : item,
                        ),
                      );
                    } else if (value) {
                      addOption(index, value);
                    }
                  }}
                  className={inputClass}
                >
                  <option value="">Select an option to add…</option>
                  {presetOptions
                    .filter((option) => !selectedOptions.some((selected) => selected.toLowerCase() === option.toLowerCase()))
                    .map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  <option value={CUSTOM_OPTION}>Custom option…</option>
                </select>

                {row.addingCustom && (
                  <div className="flex gap-2">
                    <input
                      value={row.draftOption}
                      onChange={(event) =>
                        setRows((current) =>
                          current.map((item, rowIndex) =>
                            rowIndex === index ? { ...item, draftOption: event.target.value } : item,
                          ),
                        )
                      }
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          addOption(index, row.draftOption);
                        }
                      }}
                      placeholder={`Enter custom ${normalizeType(row.name) || 'variant'} option`}
                      aria-label={`Custom option for variant ${index + 1}`}
                      className={inputClass}
                    />
                    <Button type="button" variant="outline" onClick={() => addOption(index, row.draftOption)}>
                      Add
                    </Button>
                  </div>
                )}

                {selectedOptions.length > 0 && (
                  <ul className="flex flex-wrap gap-2" aria-label={`Selected ${row.name} options`}>
                    {selectedOptions.map((option, optionIndex) => (
                      <li key={`${option}-${optionIndex}`}>
                        <button
                          type="button"
                          onClick={() => removeOption(index, optionIndex)}
                          aria-label={`Remove ${option} option`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-peach bg-peach/25 px-3 py-1.5 text-xs text-primary transition-colors hover:border-accent"
                        >
                          {normalizeType(row.name) === 'color' && (
                            <span
                              aria-hidden="true"
                              className="size-3 rounded-full border border-black/15"
                              style={{ backgroundColor: option }}
                            />
                          )}
                          {option}
                          <span aria-hidden="true">×</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
            );
          })}
        </ul>
      )}

      {rows.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="ghost" onClick={() => regenerate(rows)}>
            <Wand2 size={15} strokeWidth={1.9} aria-hidden="true" />
            Regenerate combinations
          </Button>
          <Button type="button" variant="ghost" onClick={addCombination}>
            <Plus size={15} strokeWidth={1.9} aria-hidden="true" />
            Add one combination
          </Button>
        </div>
      )}

      {combinations.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-primary">
            Combinations ({combinations.length})
          </p>

          <ul className="flex flex-col gap-2">
            {combinations.map((combination, index) => (
              <li
                key={combination._id ?? `${combination.variantName}-${index}`}
                className="grid gap-2 rounded-2xl border border-border bg-white p-3 sm:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.8fr))_auto]"
              >
                <input
                  value={combination.variantName}
                  onChange={(event) => updateCombination(index, 'variantName', event.target.value)}
                  placeholder="Combination (Red / S)"
                  aria-label={`Combination ${index + 1} name`}
                  className={inputClass}
                />

                <input
                  type="number"
                  min="0"
                  value={combination.price}
                  onChange={(event) => updateCombination(index, 'price', event.target.value)}
                  placeholder="Price"
                  aria-label={`Combination ${index + 1} price`}
                  className={inputClass}
                />

                <input
                  type="number"
                  min="0"
                  value={combination.stock}
                  onChange={(event) => updateCombination(index, 'stock', event.target.value)}
                  placeholder="Stock"
                  aria-label={`Combination ${index + 1} stock`}
                  className={inputClass}
                />

                <input
                  value={combination.sku ?? ''}
                  onChange={(event) => updateCombination(index, 'sku', event.target.value)}
                  placeholder="SKU (optional)"
                  aria-label={`Combination ${index + 1} SKU`}
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={() => removeCombination(index)}
                  aria-label={`Remove combination ${index + 1}`}
                  className="flex min-h-10 items-center justify-center rounded-xl border border-red-200 bg-white px-3 text-red-700 transition-colors hover:bg-red-50"
                >
                  <Trash2 size={15} strokeWidth={1.9} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

          <p className="text-[11px] leading-5 text-muted">
            Per-combination images are added after the product is saved, on the edit
            screen (a combination needs a saved id first).
          </p>
        </div>
      )}
    </div>
  );
}
