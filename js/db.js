const DB = {
  _familia: null,

  _handleError(error, contexto) {
    console.error(`[DB Error] ${contexto}:`, error);
    throw new Error(`Erro ao ${contexto}: ${error.message}`);
  },

  async bootstrap() {
    if (this._familia) return this._familia;

    const payload = {
      slug: SUPABASE_CONFIG.familiaSlug,
      nome: SUPABASE_CONFIG.familiaNome,
    };

    const { data, error } = await window.sb
      .from('familias')
      .upsert(payload, { onConflict: 'slug' })
      .select()
      .single();

    if (error) this._handleError(error, 'inicializar a família');

    this._familia = data;
    return data;
  },

  async _familiaId() {
    const familia = await this.bootstrap();
    return familia.id;
  },

  async getPerfil() {
    const familia = await this.bootstrap();
    return {
      id: familia.id,
      nome: familia.nome,
      slug: familia.slug,
      created_at: familia.created_at,
    };
  },

  async updatePerfil(dados) {
    const id = await this._familiaId();
    const { data, error } = await window.sb
      .from('familias')
      .update(dados)
      .eq('id', id)
      .select()
      .single();

    if (error) this._handleError(error, 'atualizar o perfil');
    this._familia = data;
    return data;
  },

  async getRendimentosFixos() {
    const familiaId = await this._familiaId();
    const { data, error } = await window.sb
      .from('rendimentos_fixos')
      .select('*')
      .eq('familia_id', familiaId)
      .eq('ativo', true)
      .order('created_at', { ascending: true });

    if (error) this._handleError(error, 'buscar rendimentos fixos');
    return data || [];
  },

  async addRendimentoFixo({ descricao, valor, responsavel, dia_recebimento }) {
    const familiaId = await this._familiaId();
    const { data, error } = await window.sb
      .from('rendimentos_fixos')
      .insert({
        familia_id: familiaId,
        descricao,
        valor,
        responsavel,
        dia_recebimento,
      })
      .select()
      .single();

    if (error) this._handleError(error, 'adicionar rendimento fixo');
    return data;
  },

  async deleteRendimentoFixo(id) {
    const familiaId = await this._familiaId();
    const { error } = await window.sb
      .from('rendimentos_fixos')
      .delete()
      .eq('id', id)
      .eq('familia_id', familiaId);

    if (error) this._handleError(error, 'remover rendimento fixo');
  },

  async getRendimentosVariaveis() {
    const familiaId = await this._familiaId();
    const { data, error } = await window.sb
      .from('rendimentos_variaveis')
      .select('*')
      .eq('familia_id', familiaId)
      .order('mes_ref', { ascending: false });

    if (error) this._handleError(error, 'buscar rendimentos variáveis');
    return data || [];
  },

  async upsertRendimentoVariavel({ mes_ref, valor, responsavel = 'meiry', descricao }) {
    const familiaId = await this._familiaId();
    const { data, error } = await window.sb
      .from('rendimentos_variaveis')
      .upsert(
        {
          familia_id: familiaId,
          mes_ref,
          valor,
          responsavel,
          descricao,
        },
        { onConflict: 'familia_id,mes_ref,responsavel' }
      )
      .select()
      .single();

    if (error) this._handleError(error, 'salvar rendimento variável');
    return data;
  },

  async getDespesasMes(mesRef) {
    const familiaId = await this._familiaId();
    const { data, error } = await window.sb
      .from('despesas')
      .select('*')
      .eq('familia_id', familiaId)
      .or(`fixa.eq.true,mes_ref.eq.${mesRef}`)
      .order('data', { ascending: false });

    if (error) this._handleError(error, 'buscar despesas do mês');
    return (data || []).filter(item => Utils.despesaAtivaNoMes(item, mesRef));
  },

  async getAllDespesas() {
    const familiaId = await this._familiaId();
    const { data, error } = await window.sb
      .from('despesas')
      .select('*')
      .eq('familia_id', familiaId)
      .order('data', { ascending: false });

    if (error) this._handleError(error, 'buscar todas as despesas');
    return data || [];
  },

  async addDespesa({ descricao, valor, categoria, data, responsavel, fixa, recorrencia_ate, observacao }) {
    const familiaId = await this._familiaId();
    const { data: row, error } = await window.sb
      .from('despesas')
      .insert({
        familia_id: familiaId,
        descricao,
        valor,
        categoria,
        data,
        mes_ref: data.slice(0, 7),
        responsavel,
        fixa: !!fixa,
        recorrencia_ate,
        observacao,
      })
      .select()
      .single();

    if (error) this._handleError(error, 'adicionar despesa');
    return row;
  },

  async updateDespesa(id, campos) {
    const familiaId = await this._familiaId();
    const { data, error } = await window.sb
      .from('despesas')
      .update(campos)
      .eq('id', id)
      .eq('familia_id', familiaId)
      .select()
      .single();

    if (error) this._handleError(error, 'atualizar despesa');
    return data;
  },

  async deleteDespesa(id) {
    const familiaId = await this._familiaId();
    const { error } = await window.sb
      .from('despesas')
      .delete()
      .eq('id', id)
      .eq('familia_id', familiaId);

    if (error) this._handleError(error, 'remover despesa');
  },

  async getCartoes() {
    const familiaId = await this._familiaId();
    const { data, error } = await window.sb
      .from('cartoes')
      .select('*')
      .eq('familia_id', familiaId)
      .eq('ativo', true)
      .order('created_at', { ascending: true });

    if (error) this._handleError(error, 'buscar cartões');
    return data || [];
  },

  async addCartao({ nome, empresa }) {
    const familiaId = await this._familiaId();
    const { data, error } = await window.sb
      .from('cartoes')
      .insert({
        familia_id: familiaId,
        nome,
        empresa,
      })
      .select()
      .single();

    if (error) this._handleError(error, 'adicionar cartão');
    return data;
  },

  async deleteCartao(id) {
    const familiaId = await this._familiaId();
    const { error } = await window.sb
      .from('cartoes')
      .delete()
      .eq('id', id)
      .eq('familia_id', familiaId);

    if (error) this._handleError(error, 'remover cartão');
  },

  async getComprasCartaoMes(mesRef) {
    const familiaId = await this._familiaId();
    const [ano, mes] = mesRef.split('-').map(Number);
    const dataLimite = new Date(ano - 2, mes - 1, 1).toISOString().split('T')[0];

    const { data, error } = await window.sb
      .from('compras_cartao')
      .select('*, cartoes(nome, empresa)')
      .eq('familia_id', familiaId)
      .gte('data_compra', dataLimite)
      .order('data_compra', { ascending: false });

    if (error) this._handleError(error, 'buscar compras do cartão');
    return data || [];
  },

  async getAllComprasCartao() {
    const familiaId = await this._familiaId();
    const { data, error } = await window.sb
      .from('compras_cartao')
      .select('*, cartoes(nome, empresa)')
      .eq('familia_id', familiaId)
      .order('data_compra', { ascending: false });

    if (error) this._handleError(error, 'buscar todas as compras do cartão');
    return data || [];
  },

  async addCompraCartao({ cartao_id, descricao, valor_total, parcelas, categoria, data_compra, observacao }) {
    const familiaId = await this._familiaId();
    const { data, error } = await window.sb
      .from('compras_cartao')
      .insert({
        familia_id: familiaId,
        cartao_id,
        descricao,
        valor_total,
        parcelas,
        categoria,
        data_compra,
        mes_ref: data_compra.slice(0, 7),
        observacao,
      })
      .select('*, cartoes(nome, empresa)')
      .single();

    if (error) this._handleError(error, 'registrar compra no cartão');
    return data;
  },

  async deleteCompraCartao(id) {
    const familiaId = await this._familiaId();
    const { error } = await window.sb
      .from('compras_cartao')
      .delete()
      .eq('id', id)
      .eq('familia_id', familiaId);

    if (error) this._handleError(error, 'remover compra do cartão');
  },
};

window.DB = DB;
