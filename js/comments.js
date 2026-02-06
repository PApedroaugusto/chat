const form = document.getElementById("commentForm");
const commentsList = document.getElementById("commentsList");

let comments = JSON.parse(localStorage.getItem("gk_comments")) || [];

function renderComments() {
  commentsList.innerHTML = "";

  comments.forEach((c, index) => {
    const div = document.createElement("div");
    div.className = "comment";
    div.innerHTML = `
      <div class="comment-header">
        <strong>${c.nome}</strong>
        <button class="delete-btn" onclick="deleteComment(${index})">✖</button>
      </div>
      <p>${c.texto}</p>
      <small>${c.data}</small>
    `;
    commentsList.appendChild(div);
  });
}

function deleteComment(index) {
  if (confirm("Deseja realmente excluir este comentário?")) {
    comments.splice(index, 1);
    localStorage.setItem("gk_comments", JSON.stringify(comments));
    renderComments();
  }
}

form.addEventListener("submit", e => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const texto = document.getElementById("comentario").value;

  const novoComentario = {
    nome,
    texto,
    data: new Date().toLocaleDateString("pt-BR")
  };

  comments.unshift(novoComentario);
  localStorage.setItem("gk_comments", JSON.stringify(comments));

  form.reset();
  renderComments();
});

renderComments();
