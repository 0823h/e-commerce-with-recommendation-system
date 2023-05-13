import Order, { IOrder } from '@src/configs/database/models/order.model';
import * as tf from '@tensorflow/tfjs';

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

    // Xây dựng mô hình neural network
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [2], units: 15, activation: 'relu' }),
        tf.layers.dense({ units: 5, activation: 'relu' }),
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
    await model.fit(x, y, { epochs: 50 });

    // Dự đoán đơn hàng thật giả
    const orderAmounts = [
      [50, 10000000],
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
