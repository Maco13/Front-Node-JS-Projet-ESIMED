class ListController extends BaseController {
    constructor() {
        super();
        this.list = self.currentList;
        this.showItems();
    }

    async showItems(){
        let date = this.list.date.toLocaleDateString();
        let chk = '';
        let content = '';
        $('#title-item-list').innerHTML = 'Liste du ' + date + ' pour ' + this.list.label;

        for (const item of await this.model.getAllItemsFromList(this.list.id)) {
            item.ischecked ? chk = 'checked' : chk = '';
            content += `<div id='row-${item.id}' class='row row-item'>
                <div class="col s1"><label class="input-field col s1"><input id="check-${item.id}" type="checkbox" ${chk} onclick="listController.clickCheck(this, ${item.id})"/><span></span></label></div>
                <div class="col s2">${item.quantite}</div>
                <div class="col s7">${item.label}</div>
                <div class="col s2">
                            <a class="btn waves-effect waves-light" title="Modifier" onclick="listController.modifItem(${item.id})"><i class="material-icons">create</i></a>
                            <a class="btn waves-effect waves-light" title="Supprimer" onclick="listController.deleteItem(${item.id})"><i class="material-icons">delete</i></a></div>
            </div>`
        }
        $('#list-item-body').innerHTML = content;

    }

    async deleteItem(id){
        try {
            let e = $(`#row-${id}`);
            let item = await this.model.getItem(id);
            if (confirm("Êtes-vous sûr de vouloir supprimer cette liste de course ? ")) {
                await this.model.deleteItem(id);
                this.deletedItem = item;
                e.parentNode.removeChild(e);
                await this.displayDeletedMessage('listController.undoDelete()');
                this.showItems();
            }
        }
        catch (e) {
            console.log(e);
        }
    }
    async undoDelete() {
        if (this.deletedItem) {
            this.model.insertItem(this.deletedItem).then(status => {
                if (status == 200) {
                    this.deletedItem = null;
                    this.displayUndoDone();
                }
            }).then(this.showCourse())
                .catch(_ => this.displayServiceError())

        }
    }

    async ajouterItem(){
        try{
            let quantite = this.validateRequiredField('#input-item-quantite', 'Quantité');
            let label = this.validateRequiredField('#input-item-label', 'Label');
            if(quantite != null && label != null){
                let item = new Item(null, label, quantite, this.list.id, false);
                await this.model.insertItem(item);
                this.showItems();
                this.toast(`${quantite} ${label} ajouté(s).`);
                $('#input-item-quantite').value = '';
                $('#input-item-label').value = '';
            }
        }
        catch (e) {
            console.log(e)
        }
    }

    async modifItem(id){
        let item = await this.model.getItem(id);
        this.currentItemUpdated = item;
        $('#input-item-modif-quantite').value = item.quantite;
        $('#input-item-modif-label').value = item.label;
        this.getModal("#modal-modif-item").open();
    }

    async updateItem(){
        let quantite = this.validateRequiredField('#input-item-modif-quantite', 'Quantité');
        let label = this.validateRequiredField('#input-item-modif-label', 'Label');
        this.currentItemUpdated.quantite = quantite;
        this.currentItemUpdated.label = label;
        if(quantite != null && label != null){
            await this.model.updateItem(this.currentItemUpdated);
            this.showItems();
            this.getModal("#modal-modif-item").close();
        }
    }

    async clickCheck(e, id){
        let item = await this.model.getItem(id);
        item.ischecked = e.checked;
        await this.model.updateItem(item);
    }

}

window.listController = new ListController();
