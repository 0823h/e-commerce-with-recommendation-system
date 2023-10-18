import Category from './category.model';
import Feedback from './feedback.model';
import Order from './order.model';
import OrderItem from './order_item.model';
import Product from './product.model';
import ProductCategory from './product_category.model';
import User from './user.model';
import Variant from './variant.model';

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
  Product.hasMany(Feedback, { foreignKey: 'product_id', hooks: true });
  Product.hasMany(Variant, { foreignKey: 'product_id' });

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

  // Variant
  Variant.belongsTo(Product, {
    foreignKey: 'product_id',
    targetKey: 'id',
  });

  // Order
  Order.hasMany(OrderItem, { foreignKey: 'order_id' });
  OrderItem.belongsTo(Order, {
    foreignKey: 'order_id',
    targetKey: 'id'
  })

  OrderItem.belongsTo(Variant, { foreignKey: 'variant_id', targetKey: 'id' });


};

models.associate = associate;

export default models;
