import Feedback, { IFeedback } from '@src/configs/database/models/feedback.model';
import { ModelStatic } from 'sequelize';

class FeedbackService {
  private readonly feedbackModel: ModelStatic<IFeedback>;
  constructor() {
    this.feedbackModel = Feedback;
  }
}

export default FeedbackService;
