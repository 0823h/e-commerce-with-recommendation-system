class Matrix {
  private matrix_data: number[][];

  constructor(n_rows: number, n_columns: number) {
    this.matrix_data = [];
    const zero_matrix_row: number[] = new Array(n_columns).fill(0);
    console.log(zero_matrix_row);
    for (let i = 0; i < n_rows; i += 1) {
      this.matrix_data = this.matrix_data.concat([zero_matrix_row]);
    }
  }

  addRow = (new_data: number[]) => {
    this.matrix_data = this.matrix_data.concat([new_data]);
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

  getData = (): number[][] => {
    return this.matrix_data;
  };

  setElement = (column: number, row: number, value: number) => {
    this.matrix_data[row][column] = value;
  };
}

export default Matrix;
