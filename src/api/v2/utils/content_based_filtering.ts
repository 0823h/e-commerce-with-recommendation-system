import { ModelStatic } from "sequelize";
import Product, { IProduct } from "@src/configs/database/models/product.model";
import natural from 'natural';
import Vector from 'vector-object';
class ContentBasedFiltering {
  private readonly productModel: ModelStatic<IProduct>
  constructor() {
    this.productModel = Product;
  }
  createVectorFromProduct = async () => {
    const tfidf = new natural.TfIdf();
    const products = await this.productModel.findAll();
    const processedProducts = products.map(product => {
      const processedProduct = {
        id: product.id.toString(),
        description: product.description
      };
      tfidf.addDocument(JSON.stringify(processedProduct));
      return processedProduct;
    })

    console.log(processedProducts.length)

    const productVectors = [];

    for (let i = 0; i < processedProducts.length; i++) {
      const processedProduct = processedProducts[i];
      const obj: any = {};

      const items = tfidf.listTerms(i);

      for (let j = 0; j < items.length; j++) {
        const item = items[j];
        obj[item.term] = item.tfidf;
      }

      const productVector = {
        id: processedProduct.id,
        vector: new Vector(obj)
      };

      console.log({ i });

      productVectors.push(productVector);

    }
    console.log(productVectors[1].vector);
    return productVectors;
  }
  calculateSimilarity = (productVectors: any) => {
    const MAX_SIMILAR = 20;
    const MIN_SCORE = 0.2;
    const data: any = {};
    for (let i = 0; i < productVectors.length; i += 1) {
      const productVector = productVectors[i];
      const { id } = productVector;
      data[id] = [];
    }

    for (let i = 0; i < productVectors.length; i += 1) {
      for (let j = 0; j < i; j++) {
        const idi = productVectors[i].id;
        const vi = productVectors[i].vector;
        const idj = productVectors[j].id;
        const vj = productVectors[j].vector;
        const similarity = vi.getCosineSimilarity(vj);

        if (similarity > MIN_SCORE) {
          data[idi].push({ id: idj, score: similarity });
          data[idj].push({ id: idi, score: similarity });
        }
      }
    }

    Object.keys(data).forEach(id => {
      data[id].sort((a: any, b: any) => b.score - a.score);

      if (data[id].length > MAX_SIMILAR) {
        data[id] = data[id].slice(0, MAX_SIMILAR);
      }
    });

    console.log({ data });
    return data;
  }
  getSimilarDocument = (id: any, trainedData: any) => {
    let similarDocuments = trainedData[id];

    if (similarDocuments === undefined) {
      return [];
    }

    console.log({ similarDocuments });
    return similarDocuments;
  }
}
export default ContentBasedFiltering;