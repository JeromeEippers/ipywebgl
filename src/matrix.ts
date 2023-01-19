export function m4ProjectionMatrix(fov_y: number, aspect_ratio: number, near: number, far: number){
    const ymax = near * Math.tan(fov_y * Math.PI / 360.0)
    const xmax = ymax * aspect_ratio

    //flip Y for notebook
    return frustrum(-xmax, xmax, -ymax, ymax, near, far)
}

function frustrum(left: number, right: number, bottom: number, top: number, near: number, far: number) {
    const A = (right + left) / (right - left)
    const B = (top + bottom) / (top - bottom)
    const C = -(far + near) / (far - near)
    const D = -2. * far * near / (far - near)
    const E = 2. * near / (right - left)
    const F = 2. * near / (top - bottom)

    return [
        E, 0, A, 0,
        0, F, B, 0,
        0, 0, C, D,
        0, 0, -1, 0
    ]
}

export function m4getTranslation(m:number[]){
    return [
        m[3], m[7], m[11]
    ];
}

export function m4getColumnI(m:number[]){
    return [
        m[0], m[4], m[8]
    ];
}

export function m4getColumnJ(m:number[]){
    return [
        m[1], m[5], m[9]
    ];
}

export function m4getColumnK(m:number[]){
    return [
        m[2], m[6], m[10]
    ];
}

export function vec3Add(a:number[], b:number[]){
    return[
        a[0] + b[0],
        a[1] + b[1],
        a[2] + b[2]
    ]
}

export function vec3Scale(a:number[], scale:number){
    return[
        a[0] * scale,
        a[1] * scale,
        a[2] * scale
    ]
}

export function m4Translation(tx:number, ty:number, tz:number) {
    return [
        1, 0, 0, tx,
        0, 1, 0, ty,
        0, 0, 1, tz,
        0, 0, 0, 1,
    ];
}

export function m4Xrotation(angleInRadians:number) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
        1, 0, 0, 0,
        0, c, -s, 0,
        0, s, c, 0,
        0, 0, 0, 1,
    ];
}

export function m4Yrotation(angleInRadians:number) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
        c, 0, s, 0,
        0, 1, 0, 0,
        -s, 0, c, 0,
        0, 0, 0, 1,
    ];
}

export function m4Zrotation(angleInRadians:number) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
        c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ];
}

export function m4Scale(sx:number, sy:number, sz:number) {
    return [
        sx, 0,  0,  0,
        0, sy,  0,  0,
        0,  0, sz,  0,
        0,  0,  0,  1,
    ];
}

export function m4dot(b:number[], a:number[]) {
    return [
        b[0] * a[0] + b[1] * a[4] + b[2] * a[8] + b[3] * a[12],
        b[0] * a[1] + b[1] * a[5] + b[2] * a[9] + b[3] * a[13],
        b[0] * a[2] + b[1] * a[6] + b[2] * a[10] + b[3] * a[14],
        b[0] * a[3] + b[1] * a[7] + b[2] * a[11] + b[3] * a[15],
        b[4] * a[0] + b[5] * a[4] + b[6] * a[8] + b[7] * a[12],
        b[4] * a[1] + b[5] * a[5] + b[6] * a[9] + b[7] * a[13],
        b[4] * a[2] + b[5] * a[6] + b[6] * a[10] + b[7] * a[14],
        b[4] * a[3] + b[5] * a[7] + b[6] * a[11] + b[7] * a[15],
        b[8] * a[0] + b[9] * a[4] + b[10] * a[8] + b[11] * a[12],
        b[8] * a[1] + b[9] * a[5] + b[10] * a[9] + b[11] * a[13],
        b[8] * a[2] + b[9] * a[6] + b[10] * a[10] + b[11] * a[14],
        b[8] * a[3] + b[9] * a[7] + b[10] * a[11] + b[11] * a[15],
        b[12] * a[0] + b[13] * a[4] + b[14] * a[8] + b[15] * a[12],
        b[12] * a[1] + b[13] * a[5] + b[14] * a[9] + b[15] * a[13],
        b[12] * a[2] + b[13] * a[6] + b[14] * a[10] + b[15] * a[14],
        b[12] * a[3] + b[13] * a[7] + b[14] * a[11] + b[15] * a[15],
    ];
}

export function m4inverse(m:number[]) {
    var tmp_0  = m[10] * m[15];
    var tmp_1  = m[14] * m[11];
    var tmp_2  = m[6] * m[15];
    var tmp_3  = m[14] * m[7];
    var tmp_4  = m[6] * m[11];
    var tmp_5  = m[10] * m[7];
    var tmp_6  = m[2] * m[15];
    var tmp_7  = m[14] * m[3];
    var tmp_8  = m[2] * m[11];
    var tmp_9  = m[10] * m[3];
    var tmp_10 = m[2] * m[7];
    var tmp_11 = m[6] * m[3];
    var tmp_12 = m[8] * m[13];
    var tmp_13 = m[12] * m[9];
    var tmp_14 = m[4] * m[13];
    var tmp_15 = m[12] * m[5];
    var tmp_16 = m[4] * m[9];
    var tmp_17 = m[8] * m[5];
    var tmp_18 = m[0] * m[13];
    var tmp_19 = m[12] * m[1];
    var tmp_20 = m[0] * m[9];
    var tmp_21 = m[8] * m[1];
    var tmp_22 = m[0] * m[5];
    var tmp_23 = m[4] * m[1];

    var t0 = (tmp_0 * m[5] + tmp_3 * m[9] + tmp_4 * m[13]) -
             (tmp_1 * m[5] + tmp_2 * m[9] + tmp_5 * m[13]);
    var t1 = (tmp_1 * m[1] + tmp_6 * m[9] + tmp_9 * m[13]) -
             (tmp_0 * m[1] + tmp_7 * m[9] + tmp_8 * m[13]);
    var t2 = (tmp_2 * m[1] + tmp_7 * m[5] + tmp_10 * m[13]) -
             (tmp_3 * m[1] + tmp_6 * m[5] + tmp_11 * m[13]);
    var t3 = (tmp_5 * m[1] + tmp_8 * m[5] + tmp_11 * m[9]) -
             (tmp_4 * m[1] + tmp_9 * m[5] + tmp_10 * m[9]);

    var d = 1.0 / (m[0] * t0 + m[4] * t1 + m[8] * t2 + m[12] * t3);

    return [
      d * t0,
      d * t1,
      d * t2,
      d * t3,
      d * ((tmp_1 * m[4] + tmp_2 * m[8] + tmp_5 * m[12]) -
           (tmp_0 * m[4] + tmp_3 * m[8] + tmp_4 * m[12])),
      d * ((tmp_0 * m[0] + tmp_7 * m[8] + tmp_8 * m[12]) -
           (tmp_1 * m[0] + tmp_6 * m[8] + tmp_9 * m[12])),
      d * ((tmp_3 * m[0] + tmp_6 * m[4] + tmp_11 * m[12]) -
           (tmp_2 * m[0] + tmp_7 * m[4] + tmp_10 * m[12])),
      d * ((tmp_4 * m[0] + tmp_9 * m[4] + tmp_10 * m[8]) -
           (tmp_5 * m[0] + tmp_8 * m[4] + tmp_11 * m[8])),
      d * ((tmp_12 * m[7] + tmp_15 * m[11] + tmp_16 * m[15]) -
           (tmp_13 * m[7] + tmp_14 * m[11] + tmp_17 * m[15])),
      d * ((tmp_13 * m[3] + tmp_18 * m[11] + tmp_21 * m[15]) -
           (tmp_12 * m[3] + tmp_19 * m[11] + tmp_20 * m[15])),
      d * ((tmp_14 * m[3] + tmp_19 * m[7] + tmp_22 * m[15]) -
           (tmp_15 * m[3] + tmp_18 * m[7] + tmp_23 * m[15])),
      d * ((tmp_17 * m[3] + tmp_20 * m[7] + tmp_23 * m[11]) -
           (tmp_16 * m[3] + tmp_21 * m[7] + tmp_22 * m[11])),
      d * ((tmp_14 * m[10] + tmp_17 * m[14] + tmp_13 * m[6]) -
           (tmp_16 * m[14] + tmp_12 * m[6] + tmp_15 * m[10])),
      d * ((tmp_20 * m[14] + tmp_12 * m[2] + tmp_19 * m[10]) -
           (tmp_18 * m[10] + tmp_21 * m[14] + tmp_13 * m[2])),
      d * ((tmp_18 * m[6] + tmp_23 * m[14] + tmp_15 * m[2]) -
           (tmp_22 * m[14] + tmp_14 * m[2] + tmp_19 * m[6])),
      d * ((tmp_22 * m[10] + tmp_16 * m[2] + tmp_21 * m[6]) -
           (tmp_20 * m[6] + tmp_23 * m[10] + tmp_17 * m[2])),
    ];
  }
