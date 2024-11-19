const cookie ={
    setCookie:(res, cookieName, data, age) => {
        res.cookie(cookieName, data, {
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
          maxAge: age,
        });
      },
    clearCookie:(res, cookieName) => {
        res.clearCookie(cookieName, {
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
        });
      },
} 

module.exports = cookie;
