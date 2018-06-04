package au.csiro.data61.magda.test.api

import java.net.URL
import scala.collection.mutable
import java.util.Properties
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ConcurrentLinkedQueue
import java.util.function.Consumer

import scala.collection.JavaConversions.mapAsJavaMap
import scala.concurrent.ExecutionContext
import scala.concurrent.Future
import scala.concurrent.duration.DurationInt

import org.elasticsearch.cluster.health.ClusterHealthStatus
import org.scalacheck.Gen
import org.scalacheck.Shrink
import org.scalatest.BeforeAndAfter
import org.scalatest.BeforeAndAfterAll
import org.scalatest.FunSpec
import org.scalatest.FunSpecLike
import org.scalatest.Matchers

import com.sksamuel.elastic4s.ElasticDsl
import com.sksamuel.elastic4s.TcpClient
import com.sksamuel.elastic4s.testkit.SharedElasticSugar
import com.typesafe.config.Config
import com.typesafe.config.ConfigFactory

import akka.actor.ActorSystem
import akka.actor.Scheduler
import akka.event.Logging
import akka.event.LoggingAdapter
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.testkit.RouteTestTimeout
import akka.http.scaladsl.testkit.ScalatestRouteTest
import akka.stream.scaladsl.Source
import au.csiro.data61.magda.AppConfig
import au.csiro.data61.magda.search.elasticsearch.ClientProvider
import au.csiro.data61.magda.search.elasticsearch.Indices
import au.csiro.data61.magda.spatial.RegionSource
import au.csiro.data61.magda.test.util.Generators
import au.csiro.data61.magda.test.util.MagdaGeneratorTest
import spray.json.JsObject
import au.csiro.data61.magda.search.elasticsearch.DefaultIndices
import au.csiro.data61.magda.test.util.TestActorSystem
import au.csiro.data61.magda.spatial.RegionLoader
import au.csiro.data61.magda.search.elasticsearch.IndexDefinition
import java.nio.file.Paths
import com.sksamuel.elastic4s.embedded.LocalNode
import java.nio.file.Path
import java.util.UUID
import org.elasticsearch.common.settings.Settings
import au.csiro.data61.magda.test.util.MagdaElasticSugar
import org.scalatest.BeforeAndAfterEach

trait BaseApiSpec extends FunSpecLike with Matchers with ScalatestRouteTest with MagdaElasticSugar with MagdaGeneratorTest with BeforeAndAfterEach{
  implicit def default(implicit system: ActorSystem) = RouteTestTimeout(30 seconds)
  def buildConfig = TestActorSystem.config
  implicit val config = buildConfig
  override def createActorSystem(): ActorSystem = TestActorSystem.actorSystem
  lazy val logger = Logging(system, getClass)
  println("create logger......");
  implicit val indexedRegions = BaseApiSpec.indexedRegions

  implicit object MockClientProvider extends ClientProvider {
    override def getClient(implicit scheduler: Scheduler, logger: LoggingAdapter, ec: ExecutionContext): Future[TcpClient] = Future(client)
  }
  def blockUntilNotRed(): Unit = {
    blockUntil("Expected cluster to have green status") { () =>
      val status = client.execute {
        clusterHealth()
      }.await(90 seconds).getStatus
      status != ClusterHealthStatus.RED
    }
  }

  override def blockUntil(explain: String)(predicate: () ⇒ Boolean): Unit = {
    var backoff = 0
    var done = false

    while (backoff <= 20 && !done) {
      backoff = backoff + 1
      try {
        done = predicate()

        if (!done) {
          logger.debug(s"Waiting another {}ms for {}", 500 * backoff, explain)
          Thread.sleep(500 * (backoff))
        } else {
          logger.debug(s"{} is true, proceeding.", explain)
        }
      } catch {
        case e: Throwable ⇒
          logger.error(e, "")
          throw e
      }
    }

    if (!done) {
      fail(s"Failed waiting on: $explain")
    }
  }

  def configWith(newProps: Map[String, String]): Config = {
    ConfigFactory.parseProperties(
      newProps.foldRight(new Properties()) { (current: (String, String), properties: Properties) ⇒
        properties.setProperty(current._1, current._2)
        properties
      }
    )
  }

  case class FakeIndices(rawIndexName: String) extends Indices {
    override def getIndex(config: Config, index: Indices.Index): String = index match {
      case Indices.DataSetsIndex => rawIndexName
      case _                     => DefaultIndices.getIndex(config, index)
    }
  }
}

object BaseApiSpec {
  val indexedRegions = Generators.indexedRegionsGen(mutable.HashMap.empty).retryUntil(_ => true).sample.get
}
