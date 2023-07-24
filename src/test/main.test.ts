import { TestDatabaseInitialization } from './database/init-container';
import { AppInitialization } from './initialization/app';
import { ProductAppControllerE2E } from './modules/product/product.controller.e2e-spec.test';

let appInit, databaseInit;
describe('Main process', () => {
    beforeEach(() => {
        const testDatabaseInitialization = new TestDatabaseInitialization();
        databaseInit = testDatabaseInitialization.init();
        appInit = AppInitialization.init();
        console.log(11);
    }, 100000000);

    databaseInit.then(() => {
        appInit.then(() => {
            const productAppControllerE2E = new ProductAppControllerE2E();
            productAppControllerE2E.run();
            expect(1).toEqual(1);
        });
    });
});
