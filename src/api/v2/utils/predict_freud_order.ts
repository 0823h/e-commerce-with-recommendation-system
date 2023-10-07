import Order, { IOrder } from '@src/configs/database/models/order.model';
import * as tf from '@tensorflow/tfjs';
import { DecisionTreeClassifier } from 'scikitjs';
import * as sk from 'scikitjs';
import { Op } from 'sequelize';

export const training = async () => {
  try {
    // Lấy dữ liệu đơn hàng từ database
    const orders: IOrder[] = await Order.findAll({
      attributes: ['total_order_amount', 'price', 'is_fraud'],
    });

    // Chuyển đổi dữ liệu thành tensor dưới định dạng JSON
    console.log(orders.map((order) => [order.total_order_amount, order.price]));
    const x = tf.tensor(orders.map((order) => [order.total_order_amount, order.price]));
    console.log(x);
    // const x = tf.tensor(orders.map((order) => order.order_amount));
    const y = tf.tensor(orders.map((order) => (order.is_fraud ? 1 : 0)));
    console.log('y: ', y);

    // Xây dựng mô hình neural network
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [2], units: 1, activation: 'relu' }),
        // tf.layers.dense({ units: 5, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' }),
      ],
    });

    model.weights.forEach((w) => {
      console.log(w.name, w.shape);
    });

    console.log(model.summary());

    // Biên dịch mô hình
    model.compile({
      optimizer: 'sgd',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });

    // Huấn luyện mô hình
    // await model.fit(x, y, { epochs: 100 });
    await model.fit(x, y, { epochs: 100 });

    // Dự đoán đơn hàng thật giả
    const orderAmounts = [
      [210, 16000000],
      [100, 100000000],
      [2, 400000],
      [5000, 200000000],
      [50, 20000000],
      [100, 100000000],
      [2, 500000],
      [5000, 20000000],
      [210, 16000000],
      [100, 100000000],
      [2, 400000],
      [5000, 200000000],
      [50, 20000000],
      [100, 100000000],
      [2, 500000],
      [5000, 20000000],
    ];

    // const orderAmounts = [50, 100, 200, 5000];
    const xTest = tf.tensor(orderAmounts);
    const yPred = model.predict(xTest) as tf.Tensor;

    console.log(yPred.dataSync());
    // Chuyển đổi tensor thành mảng
    const yPredArray = Array.from(yPred.dataSync());

    // In kết quả dự đoán
    for (let i = 0; i < orderAmounts.length; i++) {
      console.log(`Order amount ${orderAmounts[i]} is ${yPredArray[i] > 0.5 ? 'fraud' : 'real'}`);
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const decisionTree = async (order_info: IOrder) => {
  try {
    const orders: IOrder[] = await Order.findAll({
      attributes: ['total_order_amount', 'price', 'address', 'phone_number', 'email', 'is_fraud'],
      where: { [Op.or]: [{ is_fraud: true }, { is_fraud: false }] },
    });

    const x = orders.map((order) => [
      order.total_order_amount,
      order.price,
      // order.address.length,
      order.phone_number.length,
      order.email.length,
    ]);
    const y = orders.map((order) => (order.is_fraud ? 1 : 0));

    sk.setBackend(tf);

    const clf = new DecisionTreeClassifier({ criterion: 'gini', maxDepth: 4 });
    clf.fit(x, y);

    console.log(order_info);

    const order_info_cleaned = [
      order_info.total_order_amount,
      order_info.price,
      // order_info.address.length,
      order_info.phone_number.length,
      order_info.email.length,
    ];

    return clf.predict([order_info_cleaned])[0];
  } catch (error) {
    console.log(error);
    throw error;
  }
};
