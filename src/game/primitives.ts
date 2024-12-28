

export class Vec2{
    x:number
    y:number
  

    static Undefined(){
        return new Vec2()
    }

    static Defined(x:number,y:number){
        const vec = Vec2.Undefined()
        vec.x = x
        vec.y = y
        return vec
    }

    static Identity(){
        return Vec2.Defined(1,1)
    }
    static Zero(){
        return Vec2.Defined(0,0)
    }
    clone():Vec2{
        return Vec2.Defined(this.x, this.y)
    }
    subV(vec:Vec2){
        return Vec2.Defined(
            this.x - vec.x,
            this.y - vec.y,
        )
    }
    addV_self(vec:Vec2){
        this.x += vec.x
        this.y += vec.y
        return this
    }
    multS_self(val:number){
        this.x *= val
        this.y *= val
        return this
    }
    magnitude(){
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
    }
}

export class Vec3{
    x:number
    y:number
    z:number

    static Undefined(){
        return new Vec3()
    }

    static Defined(x:number,y:number,z:number){
        const vec = Vec3.Undefined()
        vec.x = x
        vec.y = y
        vec.z = z
        return vec
    }

    static Identity(){ return Vec3.Defined(1,1,1)}
    static Zero(){ return Vec3.Defined(0,0,0)}

    static Forward(){ return Vec3.Defined(0,0,1)}
    static Up(){ return Vec3.Defined(0,1,0)}
    static Right(){ return Vec3.Defined(1,0,0)}

    clone():Vec3{
        return Vec3.Defined(this.x, this.y, this.z)
    }
    multiplyS(value:number){
        const vec = Vec3.Defined(
            this.x * value,
            this.y * value,
            this.z * value,
        )
        return vec
    }
    multiplyS_self(value:number){
        this.x *= value
        this.y *= value
        this.z *= value
        return this
    }
    addV_self(vec:Vec3){
        this.x += vec.x
        this.y += vec.y
        this.z += vec.z
    }
    normalize_self(){
        const mag = Math.sqrt(Math.pow(this.x,2) + Math.pow(this.y,2) + Math.pow(this.z,2))
        if(mag == 0)return //vec has no magnituge, return cause division error
        this.x /= mag
        this.y /= mag
        this.z /= mag
        return this
    }
    magnitude(){
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2))
    }
    normalize(){
        const vec = Vec3.Undefined()
        const mag = Math.sqrt(Math.pow(this.x,2) + Math.pow(this.y,2) + Math.pow(this.z,2))
        vec.x = this.x/mag
        vec.y = this.y/mag
        vec.z = this.z/mag
        return vec
    }
    inverse_self(){
        this.x = 1/this.x
        this.y = 1/this.y
        this.z = 1/this.z
        return this
    }
}

export class Quaternion{
    r:number
    q:Vec3

    static Undefined(){
        return new Quaternion()
    }
    static Defined(r:number, q:Vec3){
        const quat = Quaternion.Undefined()
        quat.r = r
        quat.q = q
        return quat
    }
    static Euler(ang:number, axis:Vec3){
        return Quaternion.Defined(Math.cos(ang/2), axis.multiplyS_self(Math.sin(ang/2)))
    }
    static Identity(){
        return Quaternion.Defined(1, Vec3.Zero())
    }
    clone():Quaternion{
        return Quaternion.Defined(this.r, this.q.clone())
    }
    normalize_self(){
        const mag = this.magnitude()
        this.r = this.r/mag
        this.q.x = this.q.x/mag
        this.q.y = this.q.y/mag
        this.q.z = this.q.z/mag
        return this
    }
    magnitude(){
        return Math.pow(this.r,2) + Math.pow(this.q.x,2) + Math.pow(this.q.y,2) + Math.pow(this.q.z,2)
    }
    conjugate(){
        return Quaternion.Defined(
            this.r,
            this.q.multiplyS(-1)
        )
    }
    conjugate_self(){
        this.q.multiplyS_self(-1)
        return this
    }
    inverse(){
        const q = this.conjugate()
        const mag = this.magnitude()
        q.multiplyNum_self(1/mag)
        return q
    }
    inverse_self(){
        const div = Math.pow(this.r,2) + Math.pow(this.q.x,2) + Math.pow(this.q.y,2) + Math.pow(this.q.z,2)
        this.conjugate_self()
        this.multiplyNum_self(1/div)
        return this
    }
    multiplyNum_self(num:number){
        this.r *= num
        this.q.x *= num
        this.q.y *= num
        this.q.z *= num
        return this
    }
    multiplyQ(q:Quaternion){
        return Quaternion.Defined(
            this.r*q.r - this.q.x*q.q.x - this.q.y*q.q.y - this.q.z*q.q.z,
            Vec3.Defined(
                this.r*q.q.x + this.q.x*q.r + this.q.y*q.q.z - this.q.z*q.q.y,
                this.r*q.q.y - this.q.x*q.q.z + this.q.y*q.r + this.q.z*q.q.x,
                this.r*q.q.z + this.q.x*q.q.y - this.q.y*q.q.x + this.q.z*q.r,
            )
        )
    }
    multiplyQ_self(q:Quaternion){
        const quat = this.multiplyQ(q)
        this.r = quat.r
        this.q = quat.q
        return this
    }
    rotateVec3(vec:Vec3){
        const qp = Quaternion.Defined(0, vec)
        const qinv = this.inverse()

        const r = this.multiplyQ(qp).multiplyQ_self(qinv)
        return r.q
    }
    
    rotate_self(axis:Vec3, ang:number){
        // const quat = Quaternion.Defined(Math.cos(ang/2), axis.multiplyS_self(Math.sin(ang/2)))
        const quat = Quaternion.Euler(ang, axis)
        this.multiplyQ_self(quat)
        return this
    }

}

export class Matrix4x4_f32{
    mat:Float32Array

    static Undefined(){
        return new Matrix4x4_f32()
    }
    static Define(mat:Float32Array){
        const matrix = new Matrix4x4_f32()
        matrix.mat = mat
        return matrix
    }

    static Identity(){
        return Matrix4x4_f32.Define(new Float32Array([
            1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            0,0,0,1,
        ]))
    }
    clone():Matrix4x4_f32{
        return Matrix4x4_f32.Define(new Float32Array(Array.from(this.mat)))
    }
    multiplyM(mat: Matrix4x4_f32){
        const a = this.mat
        const b = mat.mat        
        const result = new Float32Array(16);
        function m(arow:number,bcol:number){
            result[4*arow + bcol] = a[4*arow+0]*b[4*0+bcol] + a[4*arow+1]*b[4*1+bcol] + a[4*arow+2]*b[4*2+bcol] + a[4*arow+3]*b[4*3+bcol]
        }
        for(let r=0; r<4 ;r++ ){
            for(let c=0; c<4; c++ ){
                m(r,c)
            }
        }
    
        return Matrix4x4_f32.Define(result);
    }
    transpose_self(){
        const mat = new Float32Array(16)
        const m = this.mat
        function t(row:number, col:number){
            mat[4*row + col] = m[4*col + row]
        }
        for(let r=0; r<4 ;r++ ){
            for(let c=0; c<4; c++ ){
                t(r,c)
            }
        }
      
        this.mat = mat
        return this
    }
}

export class Transform{
    position:Vec3
    rotation:Quaternion
    scale:Vec3

    constructor(position:Vec3, rotation:Quaternion, scale:Vec3){
        this.position = position
        this.rotation = rotation
        this.scale = scale
    }

    static Identity(){
        return new Transform(Vec3.Zero(), Quaternion.Identity(), Vec3.Identity())
    }
    clone():Transform{
        return new Transform(
            this.position.clone(),
            this.rotation.clone(),
            this.scale.clone(),
        )
    }
    inverse(){
        const t = this.clone()
        t.position.multiplyS_self(-1)
        t.rotation.inverse_self()
        // t.scale.inverse_self()
        return t
    }

}

export function transformToObjectMatrix(transform:Transform):Matrix4x4_f32{
    const p = transform.position
    const r = transform.rotation.clone().normalize_self()
    const s = transform.scale
   
    // Precompute repeated terms
    const qx2 = r.q.x * r.q.x
    const qy2 = r.q.y * r.q.y
    const qz2 = r.q.z * r.q.z
    const qr2 = r.r * r.r
    const qxqy = r.q.x * r.q.y
    const qxqz = r.q.x * r.q.z
    const qyqz = r.q.y * r.q.z
    const qxqr = r.q.x * r.r
    const qyqr = r.q.y * r.r
    const qzqr = r.q.z * r.r

    return Matrix4x4_f32.Define(new Float32Array([
        s.x * (1 - 2 * (qy2 + qz2)), 2 * s.y * (qxqy - qzqr), 2 * s.z * (qxqz + qyqr), p.x,
        2 * s.x * (qxqy + qzqr), s.y * (1 - 2 * (qx2 + qz2)), 2 * s.z * (-qxqr + qyqz), p.y,
        2 * s.x * (qxqz - qyqr), 2 * s.y * (qxqr + qyqz), s.z * (1 - 2 * (qx2 + qy2)), p.z,
        0, 0, 0, 1

    ]))
}
export function transformToViewMatrix(transform:Transform):Matrix4x4_f32{
    const p = transform.position
    const r = transform.rotation.clone().normalize_self()
    const s = transform.scale

    // Precompute repeated terms
    const qx2 = r.q.x * r.q.x
    const qy2 = r.q.y * r.q.y
    const qz2 = r.q.z * r.q.z
    const qr2 = r.r * r.r
    const qxqy = r.q.x * r.q.y
    const qxqz = r.q.x * r.q.z
    const qyqz = r.q.y * r.q.z
    const qxqr = r.q.x * r.r
    const qyqr = r.q.y * r.r
    const qzqr = r.q.z * r.r

    return Matrix4x4_f32.Define(new Float32Array([
        s.x * (1 - 2 * (qy2 + qz2)), 2 * s.x * (qxqy - qzqr), 2 * s.x * (qxqz + qyqr), s.x * (-p.x * (2 * qy2 + 2 * qz2 - 1) + 2 * p.y * (qxqy - qzqr) + 2 * p.z * (qxqz + qyqr)),
        2 * s.y * (qxqy + qzqr), s.y * (1 - 2 * (qx2 + qz2)), 2 * s.y * (-qxqr + qyqz), s.y * (2 * p.x * (qxqy + qzqr) - p.y * (2 * qx2 + 2 * qz2 - 1) - 2 * p.z * (qxqr - qyqz)),
        2 * s.z * (qxqz - qyqr), 2 * s.z * (qxqr + qyqz), s.z * (1 - 2 * (qx2 + qy2)), s.z * (2 * p.x * (qxqz - qyqr) + 2 * p.y * (qxqr + qyqz) - p.z * (2 * qx2 + 2 * qy2 - 1)),
        0, 0, 0, 1
    ]))
}

export function perspectiveMatrix(fov:number, aspRatio:number, near:number, far:number) {
    // const f = 1.0 / Math.tan((fov / 2) * (Math.PI / 180)); // Convert FOV to radians and calculate cotangent
    // const rangeInv = 1 / (far - near);

    const f = 1.0/(Math.tan(fov/2))
    const range = far-near

    const a = 1
    return Matrix4x4_f32.Define(new Float32Array([

        f/aspRatio,     0, 0,               0,
        0,              f, 0,               0,
        0,              0,-(far+near)/range,-(2*far*near)/range,
        0,              0, -1,               0,
    ]));
}