export default class Helper {
    static nicedate(id) {
        const dt = new Date(parseInt(id));
        //return dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-"+dt.getDay();
        return dt.toISOString().split("T")[0];
    }
}