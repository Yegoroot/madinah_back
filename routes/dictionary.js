import express from 'express'

import { isAuthOnly } from '../middleware/auth.js'
import {
  getDictionary,
  createDictionary,
  getCategoryDictionary,
  updateCategoryDictionary,
  deleteCategoryDictionary,
  createCategoryDictionary,
} from '../controllers/dictionary.js'

const router = express.Router()

router.use(isAuthOnly) // checking what user is

router.route('/')
  .get(getDictionary) // dictionary of current user
  .post(createDictionary) // create for current user


router.route('/:dictionaryId')
  .post(createCategoryDictionary)

router.route('/:categoryId')
  .get(getCategoryDictionary)
  .put(updateCategoryDictionary)
  .delete(deleteCategoryDictionary)


export default router
