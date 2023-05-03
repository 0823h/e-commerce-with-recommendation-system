import Order, { IOrder } from '@src/configs/database/models/order.model';
import * as tf from '@tensorflow/tfjs';

export const training = async () => {
  try {
    // Lấy dữ liệu đơn hàng từ database
    const orders: IOrder[] = await Order.findAll({
      attributes: ['order_amount', 'address', 'is_fraud'],
    });

    // Chuyển đổi dữ liệu thành tensor dưới định dạng JSON
    console.log(orders.map((order) => [order.order_amount, order.address.length]));
    const x = tf.tensor(orders.map((order) => [order.order_amount, order.address.length]));
    console.log(x);
    // const x = tf.tensor(orders.map((order) => order.order_amount));
    const y = tf.tensor(orders.map((order) => (order.is_fraud ? 1 : 0)));

    // Xây dựng mô hình neural network
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [2], units: 10, activation: 'relu' }),
        // tf.layers.dense({ inputShape: [1], units: 5, activation: 'relu' }),
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
      [50, 'dhqgg khu A'],
      [100, 'dhqg khu A'],
      [200, 'dhqg khu B'],
      [5000, 'dhqg khu C'],
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
