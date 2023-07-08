export default class Helper {
    static nicedate(id) {
        const dt = new Date(parseInt(id));
        return dt.toUTCString()
    }
}