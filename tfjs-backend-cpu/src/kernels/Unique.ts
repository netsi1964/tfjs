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

import {BackendValues, KernelConfig, KernelFunc, TensorInfo, TypedArray, Unique, UniqueInputs, util} from '@tensorflow/tfjs-core';

import {MathBackendCPU} from '../backend_cpu';
import {assertNotComplex} from '../cpu_util';

export function unique(args: {inputs: UniqueInputs, backend: MathBackendCPU}):
    TensorInfo[] {
  const {inputs, backend} = args;
  const {x} = inputs;

  assertNotComplex(x, 'unique');

  const values = backend.data.get(x.dataId).values;
  let xValues: TypedArray|string[] = values as TypedArray;
  if (x.dtype === 'string') {
    xValues = (values as Uint8Array[]).map(d => util.decodeString(d));
  }

  // A map from unique value to its index in outputValues.
  const uniqueValues = new Map<number|string, number>();
  const outputValues = [];
  const indicies = new Int32Array(xValues.length);
  for (let i = 0; i < xValues.length; i++) {
    const value = xValues[i];
    if (uniqueValues.has(value)) {
      indicies[i] = uniqueValues.get(value);
    } else {
      const uniqueIndex = uniqueValues.size;
      uniqueValues.set(value, uniqueIndex);
      indicies[i] = uniqueIndex;
      outputValues.push(values[i]);
    }
  }

  return [
    backend.makeTensorInfo(x.shape, x.dtype, outputValues as BackendValues),
    backend.makeTensorInfo(
        [indicies.length], 'int32', indicies as BackendValues),
  ];
}

export const uniqueConfig: KernelConfig = {
  kernelName: Unique,
  backendName: 'cpu',
  kernelFunc: unique as {} as KernelFunc,
};
