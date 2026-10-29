const asyncHandler = require('../utils/asyncHandler');
const caseService = require('../services/case.service');

const createCase = asyncHandler(async (req, res) => {
  const { premise, difficulty } = req.body;
  const publicCase = await caseService.createCase({ premise, difficulty });
  res.status(201).json({
    success: true,
    data: publicCase
  });
});

const getCase = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const publicCase = await caseService.getCaseByPublicId(id);
  res.status(200).json({
    success: true,
    data: publicCase
  });
});

const discoverClue = asyncHandler(async (req, res) => {
  const { id, clueId } = req.params;
  const result = await caseService.discoverClue(id, clueId);
  res.status(200).json({
    success: true,
    data: result
  });
});

const requestHint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await caseService.requestHint(id);
  res.status(200).json({
    success: true,
    data: result
  });
});

const submitAccusation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { suspectId } = req.body;
  const result = await caseService.submitAccusation(id, suspectId);
  res.status(200).json({
    success: true,
    data: result
  });
});

const getResult = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await caseService.getCaseResult(id);
  res.status(200).json({
    success: true,
    data: result
  });
});

module.exports = {
  createCase,
  getCase,
  discoverClue,
  requestHint,
  submitAccusation,
  getResult
};
