# Homebrew formula draft for terso-cli.
#
# When the v1.0.0 GitHub Release lands, this formula moves to its own tap repo
# at github.com/petrkindlmann/homebrew-terso (or under the omnus org). The
# Release workflow uploads a tarball and SHA-256, then a follow-up commit on
# the tap bumps the URL/sha block below.
#
# Until then, this file is the canonical source of the formula — review changes
# here, copy across to the tap repo at release time.

class TersoCli < Formula
  desc "Compile one AGENTS.md into per-agent configs (Claude Code, Cursor, Copilot, …)"
  homepage "https://github.com/petrkindlmann/terso-cli"
  url "https://registry.npmjs.org/terso-cli/-/terso-cli-1.0.0.tgz"
  sha256 "REPLACE_AT_RELEASE"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/terso --version")
    (testpath/"AGENTS.md").write("# rules\n")
    system "#{bin}/terso", "emit", "--dry-run"
  end
end
