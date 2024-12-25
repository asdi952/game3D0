from sympy import *


px,py,pz = symbols("p.x,p.y,p.z")


posMat = Matrix([
    [1,0,0,px],
    [0,1,0,py],
    [0,0,1,pz],
    [0,0,0,1],
]).transpose()


qr,qx,qy,qz = symbols("r.r,r.q.x,r.q.y,r.q.z")
rotMat = Matrix([
    [1-2*(qy*qy+qz*qz), 2*(qx*qy-qz*qr), 2*(qx*qz+qy*qr), 0],
    [2*(qx*qy+qz*qr), 1-2*(qx*qx+qz*qz), 2*(qy*qz-qx*qr), 0],
    [2*(qx*qz-qy*qr), 2*(qy*qz+qx*qr), 1-2*(qx*qx+qy*qy), 0],
    [0,0,0,1]
]).transpose()

sx,sy,sz = symbols("s.x,s.y,s.z")
scaMat = Matrix([
    [sx,0,0,0],
    [0,sy,0,0],
    [0,0,sz,0],
    [0,0,0,1],
]).transpose()

objMat = posMat * rotMat * scaMat
objMat = simplify(objMat)
print("objMat:")
for i in objMat:
    print(i)
# print(objMat)

print("\n\n")

viewMat = scaMat * rotMat * posMat
print("viewMat:")
for i in viewMat:
    print(i)
# print(simplify(viewMat))







