module.exports = {
    generateId,
};

function generateId(id) {
    return `id_${id.replace(" ", "_").replace("\n", "_").replace(".", "_")}`;
}
