/*
  * # Problem: When middlewares return promise, eg: async (req, res, next) => {} and either
  * throw an error, have a promise rejection or exception,
  * the exception / rejection becomes unhandled and is not passed to express error handler.
  *
  * # Solution: Wrapping all middlewares inside rejSafe
  * would catch their rejections and pass error to express' error handler
  * for logging / sending appropriate response to user.
*/
const rejSafe = function (mw) {
  return (req, res, next) => {
    mw(req, res, next)
      .catch(e => {
        next(e);
      });
  };
};

module.exports = {
  rejSafe
};
