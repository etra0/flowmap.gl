/*
 * Copyright 2019 Teralytics
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
/*
 * This file was modified by Teralytics. The original file is licenced under:
 *
 * Copyright (c) 2015-2017 Uber Technologies, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

export default `\
#define SHADER_NAME animated-flow-lines-layer-vertex-shader
#define SPEED 0.015
#define NUM_PARTS 5.0
#define DIR_OFFSET 0.0 

attribute vec3 positions;
attribute vec3 instanceSourcePositions;
attribute vec3 instanceTargetPositions;
attribute vec4 instanceSourceTargetPositions64xyLow;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;
attribute float instanceWidths;
attribute float instanceStaggering;
attribute float instancePickable;
         
uniform float opacity;
uniform float currentTime;
uniform float thicknessUnit;
    
varying vec4 vColor;
varying float sourceToTarget;

// offset vector by strokeWidth pixels
// offset_direction is -1 (left) or 1 (right)
vec2 getExtrusionOffset(vec2 line_clipspace, float offset_direction) {
  // normalized direction of the line
  vec2 dir_screenspace = normalize(line_clipspace * project_uViewportSize);
  // rotate by 90 degrees
  dir_screenspace = vec2(-dir_screenspace.y, dir_screenspace.x);

  vec2 offset_screenspace = dir_screenspace * offset_direction * instanceWidths * thicknessUnit;
  vec2 offset_clipspace = project_pixel_size_to_clipspace(offset_screenspace).xy;

  return offset_clipspace;
}

void main(void) {
  // Position
  vec4 source = project_position_to_clipspace(instanceSourcePositions, vec2(0.), vec3(0.));
  vec4 target = project_position_to_clipspace(instanceTargetPositions, vec2(0.), vec3(0.));

  // linear interpolation of source & target to pick right coord
  float segmentIndex = positions.x;
  vec4 p = mix(source, target, segmentIndex);

  // extrude
  vec2 offset = getExtrusionOffset(target.xy - source.xy, positions.y - DIR_OFFSET);
  gl_Position = p + vec4(offset, 0.0, 0.0);

  // Color
  vColor = vec4(instanceColors.rgb, instanceColors.a * opacity) / 255.;
  sourceToTarget = positions.x * length(source - target) * NUM_PARTS - currentTime * SPEED + instanceStaggering; 

  // Set color to be rendered to picking fbo (also used to check for selection highlight).
  if (instancePickable > 0.5) {
    picking_setPickingColor(instancePickingColors);
  }
}
`;
