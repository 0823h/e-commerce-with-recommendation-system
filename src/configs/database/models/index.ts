import Category from './category.model';
import Feedback from './feedback.model';
import Product from './product.model';
import ProductCategory from './product_category.model';
import User from './user.model';

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
  Product.hasMany(Feedback, { foreignKey: 'product_id', onDelete: 'CASCADE', hooks: true });

  // User
  // User.hasMany(Feedback, { foreignKey: 'user_id', onDelete: 'CASCADE', hooks: true });

  // Feedback
  // Feedback.belongsTo(User, {
  //   foreignKey: 'user_id',
  //   targetKey: 'id',
  // });

  Feedback.belongsTo(Product, {
    foreignKey: 'product_id',
    targetKey: 'id',
  });
};

models.associate = associate;

export default models;
