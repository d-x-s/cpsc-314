catRightTibiaFrame.matrix.copy(catRightFemurFrame.matrix);
catRightTibiaFrame.matrix.multiply(M.makeRotationZ(theta7)); //-(1/1.25)
catRightTibiaFrame.matrix.multiply(M.makeTranslation(0.75, -0.15, 0));
catRightTibia.matrix.copy(catRightTibiaFrame.matrix);

catRightTibiaJointFrame.matrix.copy(catRightTibiaFrame.matrix);
catRightTibiaJointFrame.matrix.multiply(M.makeTranslation(0.1, -0.8, 0,));
catRightTibiaJoint.matrix.copy(catRightTibiaJointFrame.matrix);

catRightFootFrame.matrix.copy(catRightTibiaFrame.matrix);
catRightFootFrame.matrix.multiply(M.makeRotationZ(theta8));
catRightFootFrame.matrix.multiply(M.makeTranslation(-0.75, -0.25, 0));
catRightFoot.matrix.copy(catRightFootFrame.matrix);