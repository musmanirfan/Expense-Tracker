// import { NextResponse } from "next/server";

// export function middleWare (request:any) {
//     const uid = request.cookies.get("uid")
//     const {pathName} = request.nextUrl;
//     if(!uid && pathName === "/") {
//         return NextResponse.redirect(new URL('/login',request.url))
//     }else if (uid && pathName === '/login'){
//         return NextResponse.redirect(new URL('/', request.url))
//     }
// }