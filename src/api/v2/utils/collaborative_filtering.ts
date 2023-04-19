import Feedback, { IFeedback } from '@src/configs/database/models/feedback.model';
// eslint-disable-next-line import/no-extraneous-dependencies
import nj from 'numjs';
import { ModelStatic } from 'sequelize';

// class CF {
//   private readonly feedbackModel: ModelStatic<IFeedback>;

//   constructor() {
//     this.feedbackModel = Feedback;
//   }

//   addRow =
//   // eslint-disable-next-line class-methods-use-this
//   initmatrix = async () => {
//     const Y_data: string[][];
//     Y_data = Y_data.concat([1, 2, 3]);
//   };
// }

class Matrix {
  private matrix_data: string[][];

  constructor() {
    this.matrix_data = [];
  }

  addRow = (new_data: string[]) => {
    this.matrix_data = this.matrix_data.concat(new_data);
  };

  getNRows = (): number => {
    return this.matrix_data.length;
  };

  getNColumns = (): number => {
    if (this.matrix_data.length === 0) {
      return 0;
    }
    return this.matrix_data[0].length;
  };
}
export default CF;
