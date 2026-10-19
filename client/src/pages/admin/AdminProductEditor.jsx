import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ExternalLink } from 'lucide-react';

import AdminProductForm from '../../components/admin/AdminProductForm';
import AdminProductImages from '../../components/admin/AdminProductImages';
import VariantImagePanel from '../../components/product/VariantImagePanel';
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';
import StatusPill from '../../components/dashboard/StatusPill';
import Button from '../../components/common/Button';
import { fetchCategories } from '../../slices/categorySlice';
import {
  addProduct,
  editProduct,
  editProductStatus,
  fetchProduct,
  removeProduct,
  removeProductGalleryImage,
  removeProductMainImage,
  removeVariantGalleryImage,
  removeVariantMainImage,
  saveProductImages,
  saveVariantImages,
} from '../../slices/productSlice';

// /admin/products/new and /admin/products/:productId/edit. A full page rather
// than a drawer, so the product fields and the image panel both have room. The
// backend keeps status out of POST/PUT, so publishing is its own PATCH action.
export default function AdminProductEditor() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const products = useSelector((state) => state.products);
  const categories = useSelector((state) => state.categories);

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const isEdit = Boolean(productId);

  const existing =
    products.items.find((item) => String(item._id) === String(productId)) ??
    (String(products.selectedId) === String(productId) ? products.selected : null);

  useEffect(() => {
    dispatch(fetchCategories());

    if (isEdit && !existing) dispatch(fetchProduct(productId));
  }, [dispatch, isEdit, existing, productId]);

  const handleSubmit = async (values) => {
    setBusy(true);
    setNotice(null);

    try {
      if (isEdit) {
        await dispatch(editProduct({ productId, product: values })).unwrap();
        setNotice({
          tone: 'success',
          text: 'Product saved. Publish it when an active category and an approved, active vendor are in place.',
        });
      } else {
        const created = await dispatch(addProduct(values)).unwrap();
        // Images need a saved product id, so the flow continues on the edit page
        // where the image panel is enabled.
        setNotice({
          tone: 'success',
          text: 'Draft product created. Add its images below.',
        });
        navigate(`/admin/products/${created.data._id}/edit`, { replace: true });
      }
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
    } finally {
      setBusy(false);
    }
  };

  const handleStatus = async (status) => {
    setBusy(true);
    setNotice(null);

    try {
      await dispatch(editProductStatus({ productId, status })).unwrap();
      setNotice({
        tone: 'success',
        text:
          status === 'active'
            ? 'Product published to the storefront.'
            : 'Product moved back to draft.',
      });
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    setNotice(null);

    try {
      await dispatch(removeProduct(productId)).unwrap();
      navigate('/admin/products');
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
      setBusy(false);
    }
  };

  const uploadImages = async (files) => {
    await dispatch(saveProductImages({ productId, images: files })).unwrap();
  };

  const deleteMainImage = async () => {
    await dispatch(removeProductMainImage(productId)).unwrap();
  };

  const deleteGalleryImage = async (imageIndex) => {
    await dispatch(removeProductGalleryImage({ productId, imageIndex })).unwrap();
  };

  const uploadVariantImages = async (variantId, images) => {
    await dispatch(saveVariantImages({ productId, variantId, images })).unwrap();
  };

  const deleteVariantMainImage = async (variantId) => {
    await dispatch(removeVariantMainImage({ productId, variantId })).unwrap();
  };

  const deleteVariantGalleryImage = async (variantId, imageIndex) => {
    await dispatch(removeVariantGalleryImage({ productId, variantId, imageIndex })).unwrap();
  };

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Catalog"
        title={isEdit ? 'Edit product' : 'New product'}
        description={
          isEdit
            ? 'All product fields, its images and its publish state in one place.'
            : 'Create a draft product for a vendor store, then add its images on the next screen.'
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/products"
            className="inline-flex min-h-10 items-center rounded-full border border-border bg-white px-5 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
          >
            Back to products
          </Link>

          {isEdit && existing && (
            <>
              <Link
                to={`/products/${existing._id}`}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-white px-5 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
              >
                <ExternalLink size={15} strokeWidth={1.8} aria-hidden="true" />
                View on storefront
              </Link>

              {existing.status === 'active' ? (
                <Button
                  variant="secondary"
                  onClick={() => handleStatus('draft')}
                  disabled={busy}
                >
                  Move to draft
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => handleStatus('active')}
                  disabled={busy}
                >
                  Publish
                </Button>
              )}

              <button
                type="button"
                disabled={busy}
                onClick={handleDelete}
                className="inline-flex min-h-10 items-center rounded-full border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-45"
              >
                Delete product
              </button>
            </>
          )}
        </div>
      </DashboardPageHeader>

      {isEdit && existing && (
        <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-border bg-white px-5 py-4">
          <StatusPill value={existing.status} />
          <p className="text-xs text-muted">
            {existing.name} · {existing.galleryImages?.length ?? 0} gallery{' '}
            {existing.galleryImages?.length === 1 ? 'image' : 'images'}
            {existing.mainImage ? ' · main image set' : ' · no main image yet'}
          </p>
        </div>
      )}

      {notice && (
        <p
          role={notice.tone === 'success' ? 'status' : 'alert'}
          className={[
            'rounded-3xl border px-5 py-4 text-sm',
            notice.tone === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-peach bg-peach/30 text-primary',
          ].join(' ')}
        >
          {notice.text}
        </p>
      )}

      {isEdit && !existing && products.error && (
        <p role="alert" className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {products.error}
        </p>
      )}

      <AdminProductForm
        initial={existing}
        categories={categories.items}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/products')}
        busy={busy}
      />

      <AdminProductImages
        product={isEdit ? existing : null}
        onUpload={uploadImages}
        onDeleteMain={deleteMainImage}
        onDeleteGallery={deleteGalleryImage}
        disabled={!isEdit || !existing}
        busy={busy}
      />

      <VariantImagePanel
        product={isEdit ? existing : null}
        onUpload={uploadVariantImages}
        onDeleteMain={deleteVariantMainImage}
        onDeleteGallery={deleteVariantGalleryImage}
        disabled={!isEdit || !existing}
      />

      {categories.items.length === 0 && !categories.loading && (
        <p className="rounded-3xl border border-dashed border-peach bg-peach/25 px-5 py-4 text-xs leading-5 text-muted">
          No categories exist yet, and every product needs one. Create the first
          category on the Categories page.
        </p>
      )}
    </div>
  );
}
