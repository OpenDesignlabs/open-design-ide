export class Matrix {
    constructor(a=1, b=0, c=0, d=1, tx=0, ty=0) {
        this.vals = [a, b, c, d, tx, ty];
    }
    multiply(m) {
        const [a1, b1, c1, d1, tx1, ty1] = this.vals;
        const [a2, b2, c2, d2, tx2, ty2] = m.vals;
        return new Matrix(
            a1*a2 + c1*b2, b1*a2 + d1*b2,
            a1*c2 + c1*d2, b1*c2 + d1*d2,
            a1*tx2 + c1*ty2 + tx1, b1*tx2 + d1*ty2 + ty1
        );
    }
    inverse() {
        const [a, b, c, d, tx, ty] = this.vals;
        const det = a*d - b*c;
        if (!det) return new Matrix();
        return new Matrix(d/det, -b/det, -c/det, a/det, (c*ty - d*tx)/det, (b*tx - a*ty)/det);
    }
    transformPoint(p) {
        return { x: this.vals[0]*p.x + this.vals[2]*p.y + this.vals[4], y: this.vals[1]*p.x + this.vals[3]*p.y + this.vals[5] };
    }
    static identity() { return new Matrix(); }
    static translate(x, y) { return new Matrix(1, 0, 0, 1, x, y); }
    static scale(s, cx=0, cy=0) {
        const t1 = Matrix.translate(cx, cy);
        const s1 = new Matrix(s, 0, 0, s, 0, 0);
        const t2 = Matrix.translate(-cx, -cy);
        return t1.multiply(s1).multiply(t2);
    }
}