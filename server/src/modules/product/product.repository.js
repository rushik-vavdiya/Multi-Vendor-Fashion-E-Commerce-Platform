import Product from "./product.model.js";
import { AppError } from "../../utils/AppError.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildProductFilter = (filters = {}) => {
  const query = {};
  const {
    vendorId,
    categoryId,
    status,
    name,
    minPrice,
    maxPrice,
    search,
    availability,
    variant,
    hasVariants,
  } = filters;
  const conditions = [];

  if (vendorId) {
    query.vendorId = vendorId;
  }

  if (categoryId) {
    // categoryId is a product's main category; categoryIds holds the extra
    // categories it is also listed in. A category page shows both.
    conditions.push({ $or: [{ categoryId }, { categoryIds: categoryId }] });
  }

  if (status) {
    query.status = status;
  }

  if (name) {
    query.name = { $regex: escapeRegex(String(name)), $options: "i" };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};

    if (minPrice !== undefined) {
      query.price.$gte = minPrice;
    }

    if (maxPrice !== undefined) {
      query.price.$lte = maxPrice;
    }
  }

  if (search) {
    const searchRegex = {
      $regex: escapeRegex(String(search)),
      $options: "i",
    };

    conditions.push({
      $or: [{ name: searchRegex }, { description: searchRegex }, { sku: searchRegex }],
    });
  }

  if (availability === "available") {
    conditions.push({
      $or: [{ stock: { $gt: 0 } }, { "variantCombinations.stock": { $gt: 0 } }],
    });
  } else if (availability === "unavailable") {
    conditions.push({
      $nor: [{ stock: { $gt: 0 } }, { "variantCombinations.stock": { $gt: 0 } }],
    });
  }

  if (variant) {
    const variantRegex = {
      $regex: escapeRegex(String(variant)),
      $options: "i",
    };

    conditions.push({
      $or: [
        { "variants.name": variantRegex },
        { "variants.options": variantRegex },
        { "variantCombinations.variantName": variantRegex },
      ],
    });
  }

  if (hasVariants === true) {
    conditions.push({
      $or: [{ "variants.0": { $exists: true } }, { "variantCombinations.0": { $exists: true } }],
    });
  } else if (hasVariants === false) {
    conditions.push({
      $nor: [{ "variants.0": { $exists: true } }, { "variantCombinations.0": { $exists: true } }],
    });
  }

  if (conditions.length) {
    query.$and = conditions;
  }

  return query;
};

const productSorts = {
  az: { name: 1, _id: 1 },
  "a-to-z": { name: 1, _id: 1 },
  za: { name: -1, _id: -1 },
  "z-to-a": { name: -1, _id: -1 },
  "price-low-high": { price: 1, _id: 1 },
  "low-to-high": { price: 1, _id: 1 },
  "price-high-low": { price: -1, _id: -1 },
  "high-to-low": { price: -1, _id: -1 },
  newest: { createdAt: -1, _id: -1 },
  "new-to-old": { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  "old-to-new": { createdAt: 1, _id: 1 },
};

export const productRepository = {
  createProduct: async (productData) => {
    return await Product.create(productData);
  },

  getProductById: async (productId) => {
    return await Product.findById(productId);
  },

  updateProductImages: async (productId, variantId, imageChanges) => {
    const product = await Product.findById(productId);
    if (!product) {
      return null;
    }

    const imageTarget = variantId ? product.variantCombinations.id(variantId) : product;
    if (!imageTarget) {
      return null;
    }

    const oldPublicIds = [];
    if (imageChanges.mainImage) {
      if (imageTarget.mainImagePublicId) {
        oldPublicIds.push(imageTarget.mainImagePublicId);
      }
      imageTarget.mainImage = imageChanges.mainImage.url;
      imageTarget.mainImagePublicId = imageChanges.mainImage.publicId;
    }

    if (imageChanges.galleryImages?.length) {
      if (imageTarget.galleryImages.length + imageChanges.galleryImages.length > 10) {
        throw new AppError("A maximum of 10 gallery images is allowed", 400);
      }

      const publicIds = imageTarget.galleryImagePublicIds ?? [];
      imageTarget.galleryImagePublicIds = imageTarget.galleryImages.map(
        (image, index) => publicIds[index] ?? null,
      );
      imageTarget.galleryImages.push(...imageChanges.galleryImages.map((image) => image.url));
      imageTarget.galleryImagePublicIds.push(
        ...imageChanges.galleryImages.map((image) => image.publicId),
      );
    }

    await product.save();
    return { product, oldPublicIds };
  },

  deleteProductImage: async (productId, variantId, imageType, imageIndex) => {
    const product = await Product.findById(productId);
    if (!product) {
      return null;
    }

    const imageTarget = variantId ? product.variantCombinations.id(variantId) : product;
    if (!imageTarget) {
      return null;
    }

    let publicId;
    if (imageType === "main") {
      if (!imageTarget.mainImage) {
        throw new AppError("Product image not found", 404);
      }
      publicId = imageTarget.mainImagePublicId;
      imageTarget.mainImage = null;
      imageTarget.mainImagePublicId = null;
    } else {
      if (
        !Number.isInteger(imageIndex) ||
        imageIndex < 0 ||
        imageIndex >= imageTarget.galleryImages.length
      ) {
        throw new AppError("Product gallery image not found", 404);
      }
      publicId = imageTarget.galleryImagePublicIds?.[imageIndex];
      imageTarget.galleryImages.splice(imageIndex, 1);
      imageTarget.galleryImagePublicIds.splice(imageIndex, 1);
    }

    await product.save();
    return { product, publicId };
  },

  filterProducts: async (filters = {}) => {
    const sort = productSorts[filters.sort] ?? productSorts.newest;
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const query = buildProductFilter(filters);
    const [items, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(query),
    ]);
    return { items, total, page, limit };
  },

  changeStock: async (productId, variantId, quantity) => {
    if (variantId) {
      return Product.updateOne(
        {
          _id: productId,
          status: "active",
          variantCombinations: { $elemMatch: { _id: variantId, stock: { $gte: quantity } } },
        },
        { $inc: { "variantCombinations.$.stock": -quantity } },
      );
    }

    return Product.updateOne(
      { _id: productId, status: "active", stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
    );
  },

  restoreStock: async (productId, variantId, quantity) => {
    if (variantId) {
      return Product.updateOne(
        { _id: productId, "variantCombinations._id": variantId },
        { $inc: { "variantCombinations.$.stock": quantity } },
      );
    }

    return Product.updateOne({ _id: productId }, { $inc: { stock: quantity } });
  },

  updateProduct: async (productId, updateData) => {
    return await Product.findByIdAndUpdate(
      productId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      },
    );
  },

  deleteProduct: async (productId) => {
    return await Product.findByIdAndDelete(productId);
  },

  changeProductStatus: async (productId, status) => {
    return await Product.findByIdAndUpdate(
      productId,
      { $set: { status } },
      {
        new: true,
        runValidators: true,
      },
    );
  },
};
