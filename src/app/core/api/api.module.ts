import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

/**
 * Central HTTP module.
 *
 * Even in a standalone Angular app, having a tiny module that exports HttpClientModule
 * is convenient for feature pages/services.
 */
@NgModule({
  exports: [HttpClientModule]
})
export class ApiModule {}
