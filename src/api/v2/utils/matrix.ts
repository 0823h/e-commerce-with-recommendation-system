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

export default Matrix;
