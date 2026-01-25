function handleRouteError(req,res,err, code, callback, message) {
    console.error(err);
    message = message || `An Internal Server Error Has occured! (code: ${code})\nPlease try your request again later.\n`;
    req.session.message = message;
    callback() || res.send(`${message}\n${err}`)
}

function hydrateTrackerTotals(self) {
    self.totals['expenses_calculated']
        = self.totals.expenses.reduce((a,b) => a += b, 0);
    self.totals['credits_calculated'] 
        = self.totals.credits.reduce((a,b) => a += b, 0);
    self.totals['margin'] = self.totals.expenses_calculated - self.totals.credits_calculated;
}
function hydrateTotals(self) {
    const arr1 = self.expenses ? 'expenses' : 'items'
    self.totals[`${arr1}_calculated`]
        = self.totals[arr1].reduce((a,b) => a += b, 0);
    self.totals['credits_calculated'] 
        = self.totals.credits.reduce((a,b) => a += b, 0);
    self.totals['margin'] = self.totals[`${arr1}_calculated`] - self.totals.credits_calculated;
}

module.exports = { handleRouteError, hydrateTotals };