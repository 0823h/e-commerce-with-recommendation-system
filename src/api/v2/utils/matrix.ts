class Matrix {
  private matrix_data: number[][];

  constructor() {
    this.matrix_data = [];
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
