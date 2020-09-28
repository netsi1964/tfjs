/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import {kernel_impls, KernelConfig, KernelFunc, TensorInfo, Unique, UniqueInputs} from '@tensorflow/tfjs-core';

import {MathBackendCPU} from '../backend_cpu';
import {assertNotComplex} from '../cpu_util';

export function unique(args: {inputs: UniqueInputs, backend: MathBackendCPU}):
    TensorInfo[] {
  const {inputs, backend} = args;
  const {x} = inputs;
  if (x.shape.length !== 1) {
    throw new Error(`unique() currently only supports 1-D tensor (got rank ${
        x.shape.length})`);
  }
  assertNotComplex(x, 'unique');

  const values = backend.data.get(x.dataId).values;
  const {outputValues, indices} = kernel_impls.uniqueImpl(values, x.dtype);
  return [
    backend.makeTensorInfo(x.shape, x.dtype, outputValues),
    backend.makeTensorInfo([indices.length], 'int32', indices),
  ];
}

export const uniqueConfig: KernelConfig = {
  kernelName: Unique,
  backendName: 'cpu',
  kernelFunc: unique as {} as KernelFunc,
};
