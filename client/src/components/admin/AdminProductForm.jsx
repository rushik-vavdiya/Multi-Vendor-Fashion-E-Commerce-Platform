import { useState } from 'react';

import AuthField from '../auth/AuthField';
import Button from '../common/Button';
import VariantEditor from '../product/VariantEditor';
import {
  parseSpecificationLines,
  toSpecificationLines,
} from '../../utils/specifications';

// Add / edit form for a product in the admin area. The backend keeps product
// status out of POST/PUT (server/src/modules/product/product.controller.js only
// accepts the editable fields), so publishing stays a PATCH /products/:id/status
// action on the editor page and this form never sends a status field.
export default function AdminProductForm({
  initial = null,
  categories = [],
  onSubmit,
  onCancel,
  busy = false,
  error = null,
}) {
  const [values, setValues] = useState({
    name: initial?.name ?? '',
    sku: initial?.sku ?? '',
    description: initial?.description ?? '',
    price: initial?.price ?? '',
    comarePrice: initial?.comarePrice ?? '',
    stock: initial?.stock ?? '',
    // One primary category plus any extra ones the product also belongs to.
    // Edit-form products that only have the old single categoryId still
    // preselect it.
    categoryIds: initial?.categoryIds?.length
      ? initial.categoryIds
      : initial?.categoryId
        ? [initial.categoryId]
        : [],
    specText: toSpecificationLines(initial?.productSpecifications),
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [variants, setVariants] = useState(initial?.variants ?? []);
  const [variantCombinations, setVariantCombinations] = useState(
    initial?.variantCombinations ?? [],
  );

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (values.name.trim().length < 2) nextErrors.name = 'Use at least 2 characters.';
    if (values.description.trim().length < 1) nextErrors.description = 'A description is required.';
    if (values.categoryIds.length === 0) {
      nextErrors.categoryIds = 'Choose at least one category.';
    }

    const price = Number(values.price);
    if (values.price === '' || Number.isNaN(price) || price < 0) {
      nextErrors.price = 'Enter a price of 0 or more.';
    }

    const stock = Number(values.stock);
    if (values.stock === '' || !Number.isInteger(stock) || stock < 0) {
      nextErrors.stock = 'Enter a whole number of 0 or more.';
    }

    if (values.comarePrice !== '' && Number(values.comarePrice) < 0) {
      nextErrors.comarePrice = 'Compare price cannot be negative.';
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // An empty compare price means "no discount". On an edit of a product that
    // had one, sending 0 clears it, because omitting the key leaves it as-is.
    const clearsComparePrice =
      values.comarePrice === '' && Boolean(initial?.comarePrice);

    onSubmit?.({
      name: values.name.trim(),
      description: values.description.trim(),
      price,
      stock,
      // The first pick is the product's main category; every pick is stored
      // in the list so the product appears under all of them.
      categoryId: values.categoryIds[0],
      categoryIds: values.categoryIds,
      ...(values.comarePrice === '' ? {} : { comarePrice: Number(values.comarePrice) }),
      ...(clearsComparePrice ? { comarePrice: 0 } : {}),
      ...(values.sku.trim() ? { sku: values.sku.trim() } : {}),
      productSpecifications: parseSpecificationLines(values.specText),
      variants,
      variantCombinations,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl border border-border bg-white p-5 sm:p-6"
    >
      <h2 className="text-base font-medium text-primary">
        {initial ? `Edit “${initial.name}”` : 'New product'}
      </h2>

      <p className="mb-4 rounded-2xl border border-dashed border-peach bg-peach/25 px-4 py-3 text-xs leading-5 text-muted">
        There is no vendor picker. A vendor account saves products under its own
        store; a product an admin creates belongs to the marketplace itself, so it
        has no store and can be published without one.
      </p>

      <div className="mt-4 flex flex-col gap-5">
        <AuthField
          label="Product name"
          name="admin-product-name"
          value={values.name}
          onChange={handleChange('name')}
          error={fieldErrors.name}
          placeholder="For example: Linen Blend Oversized Shirt"
          required
        />

        <AuthField
          label="SKU"
          name="admin-product-sku"
          value={values.sku}
          onChange={handleChange('sku')}
          placeholder="Optional, for example RN-MSH-02"
        />

        <div className="flex w-full flex-col gap-1.5">
          <label htmlFor="admin-product-description" className="text-sm font-medium text-primary">
            Description
            <span className="text-accent"> *</span>
          </label>

          <textarea
            id="admin-product-description"
            rows={4}
            value={values.description}
            onChange={handleChange('description')}
            aria-invalid={Boolean(fieldErrors.description)}
            className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15"
          />

          {fieldErrors.description && (
            <p className="text-xs text-red-600">{fieldErrors.description}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <AuthField
            label="Price (₹)"
            name="admin-product-price"
            type="number"
            inputMode="decimal"
            value={values.price}
            onChange={handleChange('price')}
            error={fieldErrors.price}
            required
          />

          <AuthField
            label="Compare price (₹)"
            name="admin-product-compare-price"
            type="number"
            inputMode="decimal"
            value={values.comarePrice}
            onChange={handleChange('comarePrice')}
            error={fieldErrors.comarePrice}
            hint="Leave empty for no discount."
          />

          <AuthField
            label="Stock"
            name="admin-product-stock"
            type="number"
            inputMode="numeric"
            value={values.stock}
            onChange={handleChange('stock')}
            error={fieldErrors.stock}
            required
          />
        </div>

        <div className="flex w-full flex-col gap-1.5">
          <span className="text-sm font-medium text-primary">
            Categories
            <span className="text-accent"> *</span>
          </span>

          {/* Tick every category the product belongs to. Tick order decides the
              main one: the first ticked category is the product's main
              category, the rest are extra. Plain checkboxes, no library. */}
          <div
            role="group"
            aria-label="Product categories"
            className="flex flex-col overflow-hidden rounded-xl border border-border bg-white"
          >
            {categories.length === 0 && (
              <p className="px-4 py-3 text-sm text-muted">No categories yet.</p>
            )}

            {categories.map((category, index) => {
              const checked = values.categoryIds.includes(category._id);
              // Position in the picked list decides the "Main" tag.
              const pickIndex = values.categoryIds.indexOf(category._id);

              return (
                <label
                  key={category._id}
                  className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-primary transition-colors hover:bg-peach/30 ${
                    index > 0 ? 'border-t border-border' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      setValues((current) => ({
                        ...current,
                        categoryIds: checked
                          ? current.categoryIds.filter((id) => id !== category._id)
                          : [...current.categoryIds, category._id],
                      }));
                      setFieldErrors((current) => ({ ...current, categoryIds: undefined }));
                    }}
                    className="size-4 shrink-0 accent-[var(--accent)]"
                  />

                  <span className="min-w-0 flex-1 truncate">
                    {category.name}
                    {category.status !== 'active' ? ' (draft category)' : ''}
                  </span>

                  {pickIndex === 0 && (
                    <span className="shrink-0 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Main
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {fieldErrors.categoryIds && (
            <p className="text-xs text-red-600">{fieldErrors.categoryIds}</p>
          )}

          <p className="text-xs text-muted">
            Tick every category this product belongs to. The first one you tick
            is the main category. Publishing needs an active category.
          </p>
        </div>

        <div className="flex w-full flex-col gap-1.5">
          <label htmlFor="admin-product-specifications" className="text-sm font-medium text-primary">
            Specifications
          </label>

          <textarea
            id="admin-product-specifications"
            rows={4}
            value={values.specText}
            onChange={handleChange('specText')}
            placeholder={'Material: 55% linen, 45% viscose\nFit: Oversized\nCare: Gentle machine wash'}
            className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15"
          />

          <p className="text-xs text-muted">
            One detail per line as “Label: value”. They appear in the product
            information panel on the product page.
          </p>
        </div>

        <VariantEditor
          variants={variants}
          combinations={variantCombinations}
          basePrice={Number(values.price) || 0}
          baseStock={Number(values.stock) || 0}
          onChange={({ variants: nextVariants, variantCombinations: nextCombinations }) => {
            setVariants(nextVariants);
            setVariantCombinations(nextCombinations);
          }}
        />
      </div>

      {error && (
        <p role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </p>
      )}

      <p className="mt-5 text-xs text-muted">
        New and edited products are stored as drafts. Publish with PATCH
        /products/:id/status, which needs an active category and an approved,
        active vendor.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary" loading={busy} disabled={busy}>
          {initial ? 'Save product' : 'Create draft product'}
        </Button>

        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
