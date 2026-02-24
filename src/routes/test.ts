import { Router } from 'express';
import { testDB, testAPI } from '../controllers/testController';

const router = Router();

router.get('/', testAPI);
router.get('/db', testDB);

export default router;