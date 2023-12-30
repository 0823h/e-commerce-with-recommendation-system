import nj, { NjArray } from 'numjs';

class Matrix {
  private matrix_data: nj.NdArray<number>;
  private n_rows;
  private n_columns;

  constructor(n_rows: number, n_columns: number) {
    this.n_rows = n_rows;
    this.n_columns = n_columns;
    this.matrix_data = nj.zeros([this.n_rows, this.n_columns], 'float32');
  }

  getNRows = (): number => {
    return this.n_rows;
  };

  getNColumns = (): number => {
    return this.n_columns;
  };

  setData = (row_index: number, col_index: number, value: number) => {
    this.matrix_data.set(row_index, col_index, value);
  };

  getRow = (row_index: number): nj.NdArray<number> => {
    const row = nj.zeros(this.n_columns, 'float32');
    for (let i = 0; i < this.n_columns; i += 1) {
      row.set(i, this.matrix_data.get(row_index, i));
    }
    return row;
  };

  getColumn = (col_index: number) => {
    // console.log(this.matrix_data.tolist());
    const col = nj.zeros(this.n_rows, 'float32');
    for (let i = 0; i < this.n_rows; i += 1) {
      col.set(i, this.matrix_data.get(i, col_index));
    }
    return col;
  };

  getMeanUsers = () => {
    const m_users = nj.zeros(this.n_columns, 'float32');
    for (let i = 0; i < this.n_columns; i += 1) {
      let n_rated = 0;
      const user_column = this.getColumn(i);
      for (let i = 0; i < this.n_rows; i += 1) {
        if (user_column.get(i) !== 0) {
          n_rated += 1;
        }
      }
      m_users.set(i, user_column.sum() / n_rated);
    }
    return m_users;
  };

  getYbar = () => {
    let Y_bar = new Matrix(this.n_rows, this.n_columns);
    Y_bar = this.cloneMatrix();
    // Y_bar.print();

    const m_users = this.getMeanUsers();
    for (let i = 0; i < this.n_columns; i += 1) {
      for (let j = 0; j < this.n_rows; j += 1) {
        const value = Y_bar.getValue(j, i);
        if (value !== 0) {
          Y_bar.setData(j, i, value - m_users.get(i));
        }
      }
    }

    return Y_bar;
  };

  cloneMatrix = (): Matrix => {
    const c_matrix = new Matrix(this.n_rows, this.n_columns);
    c_matrix.matrix_data = this.matrix_data.clone();
    return c_matrix;
  };

  getValue = (row_index: number, col_index: number) => {
    return this.matrix_data.get(row_index, col_index);
  };

  getData = () => {
    return this.matrix_data;
  };

  getUsersWhoRateProduct = (user_id: number, product_id: number): number[] => {
    const row = this.getRow(product_id).tolist();
    const user_who_rate_ids: number[] = [];
    row.forEach((user_rate, index) => {
      if (user_id !== index && user_rate !== 0) {
        user_who_rate_ids.push(index);
      }
    });
    return user_who_rate_ids;
  };

  getProductsNotRateYet = (user_id: number): number[] => {
    const product_ids: number[] = [];
    const col = this.getColumn(user_id).tolist();
    col.forEach((user_rate, index) => {
      if (user_rate === 0) {
        product_ids.push(index);
      }
    });
    return product_ids;
  };

  print = () => {
    console.log('Matrix_data: ');
    console.log(this.matrix_data.reshape(this.n_rows, this.n_columns).tolist());
  };
}

export default Matrix;
