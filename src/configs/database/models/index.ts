import Category from './category.model';
import Product from './product.model';
import ProductCategory from './product_category.model';

const models: { associate?: () => Promise<void> } = {};

const associate = async (): Promise<void> => {
  // Category
  Category.belongsToMany(Product, {
    through: ProductCategory,
    foreignKey: 'category_id',
  });

  // Product
  Product.belongsToMany(Category, {
    through: ProductCategory,
    foreignKey: 'product_id',
  });
};

models.associate = associate;

export default models;
